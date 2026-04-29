const siteContent = require("./site-content.json");

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function normalizeAssetPath(value) {
  const normalized = normalizeUrl(value);

  if (!normalized || normalized === "/") {
    return "";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function normalizeTelephoneHref(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

module.exports = function() {
  const siteName = siteContent.name || "Codeboxx";
  const siteUrl = normalizeUrl(siteContent.url);
  const telephone = siteContent.telephone || "";

  return {
    name: siteName,
    url: siteUrl,
    absoluteUrl: siteUrl,
    assetPath: normalizeAssetPath(process.env.ASSET_PATH),
    address1: siteContent.address1 || "",
    address2: siteContent.address2 || "",
    townCity: siteContent.townCity || "",
    countyState: siteContent.countyState || "",
    postcode: siteContent.postcode || "",
    country: siteContent.country || "",
    copyrightOwner: siteContent.copyrightOwner || siteName,
    email: siteContent.email || "",
    siteID: "Codeboxx",
    socialImage: "/images/codeboxx-supplies.svg",
    authorName: siteName,
    authorEmail: siteContent.email || "",
    authortelephone: telephone,
    telephone: telephone,
    telephoneHref: normalizeTelephoneHref(telephone),
    whatsapp: siteContent.whatsapp || "",
  };
};
