const pdf = require("pdf-parse");

const extractGSTDetails = async (buffer) => {
  const data = await pdf(buffer);
  const text = data.text;

  // GSTIN
  const gstMatch = text.match(/GSTIN\s*([0-9A-Z]{15})/);
  const gstNumber = gstMatch ? gstMatch[1] : null;

  // Legal Name
  const nameMatch = text.match(/Legal Name\s(.+)/);
  const legalName = nameMatch ? nameMatch[1].trim() : null;

  // Address
  const addressMatch = text.match(
    /Address of Principal Place of\s+Business\s+([\s\S]*?)\n\s*\d/
  );
  const address = addressMatch ? addressMatch[1].replace(/\n/g, " ") : null;

  // Email (rare in GST, optional)
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/);
  const gstEmail = emailMatch ? emailMatch[0] : null;

  return {
    gstNumber,
    legalName,
    address,
    gstEmail,
  };
};

module.exports = { extractGSTDetails };