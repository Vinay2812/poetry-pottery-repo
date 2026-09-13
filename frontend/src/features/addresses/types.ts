import type {
  AddressFieldsFragment,
  AddressInput,
} from "@/graphql/generated/graphql";
import type { AddressFormValues } from "@/lib/validations/address";

export type SavedAddress = AddressFieldsFragment;

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

export function toAddressInput(values: AddressFormValues): AddressInput {
  return {
    name: values.name,
    phone: values.phone,
    line1: values.line1,
    line2: values.line2 || null,
    landmark: values.landmark || null,
    city: values.city,
    state: values.state,
    pincode: values.pincode,
    is_default: values.is_default,
  };
}

export function toFormValues(address: SavedAddress): AddressFormValues {
  return {
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? "",
    landmark: address.landmark ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    is_default: address.is_default,
  };
}

export function toAddressLines(
  line1: string,
  line2: string | null,
  landmark: string | null,
  city: string,
  state: string,
  pincode: string,
): string {
  return [line1, line2, landmark, `${city}, ${state} ${pincode}`]
    .filter((part) => Boolean(part))
    .join(", ");
}

// The default is what people expect to be picked; a single saved address is just as obvious.
export function toPreferredAddressId(
  addresses: readonly SavedAddress[],
): number | null {
  const preferred =
    addresses.find((address) => address.is_default) ??
    (addresses.length === 1 ? addresses[0] : undefined);
  return preferred?.id ?? null;
}

export function sortByDefaultFirst(
  addresses: readonly SavedAddress[],
): SavedAddress[] {
  return [...addresses].sort(
    (a, b) => Number(b.is_default) - Number(a.is_default),
  );
}

// Mirrors the server: one default per person, and the list stays default first.
export function withDefaultOn(
  addresses: readonly SavedAddress[],
  id: number,
): SavedAddress[] {
  return sortByDefaultFirst(
    addresses.map((address) => ({
      ...address,
      is_default: address.id === id,
    })),
  );
}

// Mirrors the server: deleting the default promotes the newest address that is left.
export function afterDelete(
  addresses: readonly SavedAddress[],
  id: number,
): SavedAddress[] {
  const wasDefault =
    addresses.find((address) => address.id === id)?.is_default ?? false;
  const remaining = addresses.filter((address) => address.id !== id);
  const promoted = remaining[0];
  return wasDefault && promoted
    ? withDefaultOn(remaining, promoted.id)
    : remaining;
}

// The cache only normalises an optimistic address when it carries its type name.
export function toOptimisticDefault(
  address: SavedAddress,
): SavedAddress & { __typename: "Address" } {
  return { ...address, __typename: "Address", is_default: true };
}
