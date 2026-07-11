const generateOrgId = (lastOrgId) => {
  let nextSuffix = "AAA";

  if (lastOrgId && lastOrgId.startsWith("FIQO000")) {
    const lastSuffix = lastOrgId.slice(7); // Get the part after FIQO000
    if (/^[A-Z]+$/.test(lastSuffix)) {
      let carry = 1;
      let res = "";
      for (let i = lastSuffix.length - 1; i >= 0; i--) {
        let charCode = lastSuffix.charCodeAt(i);
        if (carry > 0) {
          charCode += carry;
          if (charCode > 90) { // 'Z' is 90
            charCode = 65; // 'A' is 65
            carry = 1;
          } else {
            carry = 0;
          }
        }
        res = String.fromCharCode(charCode) + res;
      }
      if (carry > 0) {
        res = "A" + res; // e.g. ZZZ -> AAAA
      }
      nextSuffix = res;
    }
  }

  // Generate ID like FIQO000AAA
  return `FIQO000${nextSuffix}`;
};

module.exports = { generateOrgId };
