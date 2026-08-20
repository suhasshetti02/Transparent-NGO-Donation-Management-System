export const ADMINS = [
  "0x4F5bF4A4A3792757444212ab82eB968B76E4fFaE",
  "0x50909Eea8B572b23cB39C5e82a8c8e2d0Ed247eF",
  "0x313739990e71FC982104Bce13818423Ec0c67FeA",
  "0x93Af7b57F6D0306923ba17aD05E567Db9f97A4ae"
];

export function isAdmin(address) {
  return ADMINS.map(a => a.toLowerCase()).includes(address.toLowerCase());
}
