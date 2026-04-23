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

module.exports = function() {
  return {
    name: "Codeboxx",
    url: "",
    absoluteUrl: "",
    assetPath: normalizeAssetPath(process.env.ASSET_PATH),
    address1: "Unit 4, Riverside Business Park",
    address2: "",
    townCity: "Cefn-y-bedd",
    countyState: "Wrexham",
    postcode: "LL12 9YG",
    country: "Cymru/Wales",
    copyrightOwner: "Codeboxx",
    email: "info@gekko-coding.com",
    siteID: "Codeboxx",
    socialImage: "/images/codeboxx-supplies.svg",
    authorName: "Codeboxx",
    authorEmail: "info@gekko-coding.com",
    authortelephone: "+44 (0)1978 761122",
    telephone: "+44 (0)1978 761122",
    telephoneHref: "+441978761122",
  };
};
