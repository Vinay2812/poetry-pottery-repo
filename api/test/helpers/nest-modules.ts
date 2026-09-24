import type { DynamicModule, ForwardReference, Type } from "@nestjs/common";
import { MODULE_METADATA } from "@nestjs/common/constants";
import { RESOLVER_TYPE_METADATA } from "@nestjs/graphql";

export type ClassRef = abstract new (...args: never[]) => object;

function isClass(value: unknown): value is ClassRef {
  return typeof value === "function";
}

function listAt(target: object, key: string): unknown[] {
  const value: unknown = Reflect.getMetadata(key, target);
  return Array.isArray(value) ? (value as unknown[]) : [];
}

function providerClass(provider: unknown): ClassRef | null {
  if (isClass(provider)) return provider;
  if (typeof provider === "object" && provider !== null) {
    const useClass: unknown = Reflect.get(provider, "useClass");
    if (isClass(useClass)) return useClass;
  }
  return null;
}

function isForwardReference(
  entry: unknown,
): entry is ForwardReference<() => unknown> {
  return typeof entry === "object" && entry !== null && "forwardRef" in entry;
}

function isDynamicModule(entry: unknown): entry is DynamicModule {
  return typeof entry === "object" && entry !== null && "module" in entry;
}

// Every class a module tree provides, read from the same @Module metadata Nest boots from; depth 1 stops at root's imports.
export async function providedClasses(
  root: Type,
  maxDepth = Infinity,
): Promise<Set<ClassRef>> {
  const seen = new Set<unknown>();
  const found = new Set<ClassRef>();

  const visit = async (entry: unknown, depth: number): Promise<void> => {
    const resolved: unknown = isForwardReference(entry)
      ? entry.forwardRef()
      : await entry;
    if (seen.has(resolved)) return;
    seen.add(resolved);
    const moduleClass = isDynamicModule(resolved) ? resolved.module : resolved;
    if (!isClass(moduleClass)) {
      throw new Error(`Cannot read module ${String(resolved)}`);
    }
    const imports = listAt(moduleClass, MODULE_METADATA.IMPORTS);
    const providers = listAt(moduleClass, MODULE_METADATA.PROVIDERS);
    if (isDynamicModule(resolved)) {
      imports.push(...(resolved.imports ?? []));
      providers.push(...(resolved.providers ?? []));
    }
    for (const provider of providers) {
      const cls = providerClass(provider);
      if (cls) found.add(cls);
    }
    if (depth >= maxDepth) return;
    for (const child of imports) await visit(child, depth + 1);
  };

  await visit(root, 0);
  return found;
}

// @Resolver() always defines this key on the class, with an undefined value when it names no type.
export function isResolver(cls: ClassRef): boolean {
  return Reflect.hasMetadata(RESOLVER_TYPE_METADATA, cls);
}

export async function providedResolvers(
  root: Type,
  maxDepth = Infinity,
): Promise<Set<ClassRef>> {
  const classes = await providedClasses(root, maxDepth);
  return new Set([...classes].filter(isResolver));
}

export function namesOf(classes: Iterable<ClassRef>): string[] {
  return [...classes].map((cls) => cls.name).sort();
}
