type AddressPublicState = "public" | "private" | "exclude";

export const formatAddress = (
  address: string | null | undefined,
  isAddressPublic: AddressPublicState | null | undefined
): string => {
  if (!address) {
    return "주소 정보 없음";
  }

  switch (isAddressPublic) {
    case "public":
      return address;
    case "private":
      return "비공개";
    case "exclude": {
      const parts = address.split(" ");
      const addressUpToEupMyeonDong = [];

      // Get address parts up to '읍', '면', or '동'
      let foundEupMyeonDong = false;
      for (const part of parts) {
        addressUpToEupMyeonDong.push(part);
        if (part.endsWith("읍") || part.endsWith("면") || part.endsWith("동")) {
          foundEupMyeonDong = true;
          break;
        }
      }
      let finalAddress = addressUpToEupMyeonDong.join(" ");

      // Check for legal-dong in parentheses
      const matchParentheses = address.match(/\(([^)]+)\)/);
      if (matchParentheses) {
        const legalDongPart = `(${matchParentheses[1]})`;
        if (!finalAddress.includes(legalDongPart)) {
          finalAddress += ` ${legalDongPart}`;
        }
      }

      // If no '읍', '면', or '동' was found, take the first 2 parts
      if (!foundEupMyeonDong) {
        return `${parts[0] || ""} ${parts[1] || ""}`.trim();
      }

      return finalAddress;
    }
    default:
      // If isAddressPublic is not defined or null, treat as public
      return address;
  }
};
