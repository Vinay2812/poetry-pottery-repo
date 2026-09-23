import {
  type ASTVisitor,
  GraphQLError,
  Kind,
  type SelectionSetNode,
  type ValidationContext,
  type ValidationRule,
} from "graphql";

// The storefront's deepest operation is 5 levels; 8 leaves room without letting Glaze.pieces <-> Product.glaze recurse.
export const MAX_QUERY_DEPTH = 8;

function selectionDepth(
  context: ValidationContext,
  selectionSet: SelectionSetNode,
  fragmentsSeen: ReadonlySet<string>,
): number {
  let deepest = 0;
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      // Introspection is gated separately and legitimately deep.
      if (selection.name.value.startsWith("__")) continue;
      const below = selection.selectionSet
        ? selectionDepth(context, selection.selectionSet, fragmentsSeen)
        : 0;
      deepest = Math.max(deepest, 1 + below);
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      deepest = Math.max(
        deepest,
        selectionDepth(context, selection.selectionSet, fragmentsSeen),
      );
    } else {
      const name = selection.name.value;
      const fragment = context.getFragment(name);
      // Fragment cycles are reported by the built-in NoFragmentCycles rule.
      if (!fragment || fragmentsSeen.has(name)) continue;
      deepest = Math.max(
        deepest,
        selectionDepth(
          context,
          fragment.selectionSet,
          new Set([...fragmentsSeen, name]),
        ),
      );
    }
  }
  return deepest;
}

export function depthLimitRule(maxDepth: number): ValidationRule {
  return (context: ValidationContext): ASTVisitor => ({
    OperationDefinition(node) {
      const depth = selectionDepth(context, node.selectionSet, new Set());
      if (depth > maxDepth) {
        context.reportError(
          new GraphQLError(
            `Query is nested ${depth} levels deep; the limit is ${maxDepth}`,
            { nodes: [node] },
          ),
        );
      }
    },
  });
}
