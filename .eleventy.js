const markdownIt = require("markdown-it");
const features = require("./features.json");

// Filters
const dateFilter = require("./src/filters/date-filter.js");
const md = markdownIt({ html: true });
const isProduction = process.env.ELEVENTY_ENV === "production";

function minifyHtmlOutput(content, outputPath) {
  if (!isProduction || !outputPath || !outputPath.endsWith(".html")) {
    return content;
  }

  return content
    .replace(/<!--(?!\[if[\s\S]*?endif\]-->)[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function sortProducts(left, right) {
  const categoryCompare = (left.data.category || "").localeCompare(right.data.category || "");

  if (categoryCompare !== 0) {
    return categoryCompare;
  }

  return (left.data.title || "").localeCompare(right.data.title || "");
}

function getProductManufacturers(items) {
  const excludedManufacturers = new Set(["Armor TTR", "DMseries"]);
  const manufacturers = new Set();

  items.forEach((item) => {
    if (item.data.manufacturer && !excludedManufacturers.has(item.data.manufacturer)) {
      manufacturers.add(item.data.manufacturer);
    }
  });

  return Array.from(manufacturers).sort((left, right) => left.localeCompare(right));
}

function getProductCategories(items) {
  const categories = new Set();

  items.forEach((item) => {
    if (item.data.category) {
      categories.add(item.data.category);
    }
  });

  return Array.from(categories).sort((left, right) => left.localeCompare(right));
}

module.exports = function(eleventyConfig) {
  // Filters
  eleventyConfig.addFilter("dateFilter", dateFilter);
  eleventyConfig.addFilter("getProductCategories", getProductCategories);
  eleventyConfig.addFilter("getProductManufacturers", getProductManufacturers);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("markdown", (content) => {
    if (!content) {
      return "";
    }

    return md.render(content);
  });

  eleventyConfig.addTransform("optimizeHtml", (content, outputPath) => {
    return minifyHtmlOutput(content, outputPath);
  });

  eleventyConfig.addCollection("productItems", (collection) => {
    return collection.getFilteredByGlob("./src/products/*.md").sort(sortProducts);
  });

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/images");

  if (features.blog) {
    const blogPlugin = require("./feature-packs/blog/plugin.js");
    blogPlugin(eleventyConfig);
  }

  if (features.changelog) {
    const changelogPlugin = require("./feature-packs/changelog/plugin.js");
    changelogPlugin(eleventyConfig);
  }

  if (features.faqs) {
    const faqsPlugin = require("./feature-packs/faqs/plugin.js");
    faqsPlugin(eleventyConfig);
  }

  if (features.portfolio) {
    const portfolioPlugin = require("./feature-packs/portfolio/plugin.js");
    portfolioPlugin(eleventyConfig);
  }

  if (features.team) {
    const teamPlugin = require("./feature-packs/team/plugin.js");
    teamPlugin(eleventyConfig);
  }

  // Use .eleventyignore, not .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Directory structure
  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
