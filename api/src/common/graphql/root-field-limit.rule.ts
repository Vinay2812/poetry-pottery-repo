import {
  type ASTVisitor,
  GraphQLError,
  Kind,
  type SelectionSetNode,
  type ValidationContext,
  type ValidationRule,
} from "graphql";

// Rate limits count per resolver, so one aliased request could otherwise fan out across every public query.
// Every storefront and admin operation asks for a single root field; 5 leaves room without that fan-out.
export const MAX_ROOT_FIELDS = 5;

function rootFieldCount(
  context: ValidationContext,
  selectionSet: SelectionSetNode,
  fragmentsSeen: ReadonlySet<string>,
): number {
  let count = 0;
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      // __typename and introspection never reach a resolver.
      if (!selection.name.value.startsWith("__")) count += 1;
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      count += rootFieldCount(context, selection.selectionSet, fragmentsSeen);
    } else {
      const name = selection.name.value;
      const fragment = context.getFragment(name);
      // Fragment cycles are reported by the built-in NoFragmentCycles rule.
      if (!fragment || fragmentsSeen.has(name)) continue;
      count += rootFieldCount(
        context,
        fragment.selectionSet,
        new Set([...fragmentsSeen, name]),
      );
    }
  }
  return count;
}

export function rootFieldLimitRule(maxFields: number): ValidationRule {
  return (context: ValidationContext): ASTVisitor => ({
    OperationDefinition(node) {
      const count = rootFieldCount(context, node.selectionSet, new Set());
      if (count > maxFields) {
        context.reportError(
          new GraphQLError(
            `Operation asks for ${count} root fields; the limit is ${maxFields}`,
            { nodes: [node] },
          ),
        );
      }
    },
  });
}
