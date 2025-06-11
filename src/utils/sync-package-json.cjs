const fs = require("fs");

const SOURCE_PACKAGE_JSON = "package-source.json"; // Backup package.json before merge
const TARGET_PACKAGE_JSON = "package.json"; // The package.json after merge

// Define sections to sync (dependencies, devDependencies, resolutions)
const SECTIONS_TO_SYNC = ["dependencies", "devDependencies", "resolutions"];
// Define specific dependencies to restore
const KEYS_TO_SYNC = ["@salesforce-ux/design-system", "@salesforcedevs/playground-metadata", "lwc"];

function syncDependencies() {
  if (!fs.existsSync(SOURCE_PACKAGE_JSON) || !fs.existsSync(TARGET_PACKAGE_JSON)) {
    console.error("❌ Source or target package.json not found!");
    process.exit(1);
  }

  const sourcePackageJson = JSON.parse(fs.readFileSync(SOURCE_PACKAGE_JSON, "utf-8"));
  const targetPackageJson = JSON.parse(fs.readFileSync(TARGET_PACKAGE_JSON, "utf-8"));

  let updated = false;
  const foundKeys = new Set();
  const changes = [];

  // First, collect the latest values from source regardless of section
  const latestVersions = {};
  SECTIONS_TO_SYNC.forEach((section) => {
    if (sourcePackageJson[section]) {
      KEYS_TO_SYNC.forEach((key) => {
        if (sourcePackageJson[section][key]) {
          latestVersions[key] = sourcePackageJson[section][key];
        }
      });
    }
  });

  // Now, update the target package.json, placing keys in their existing section
  SECTIONS_TO_SYNC.forEach((section) => {
    if (targetPackageJson[section]) {
      KEYS_TO_SYNC.forEach((key) => {
        if (targetPackageJson[section][key] && latestVersions[key] && targetPackageJson[section][key] !== latestVersions[key]) {
          changes.push(`🔄 Updated ${key} in ${section}: ${targetPackageJson[section][key]} → ${latestVersions[key]}`);
          targetPackageJson[section][key] = latestVersions[key];
          foundKeys.add(key);
          updated = true;
        }
      });
    }
  });

  // If any keys were missing from all sections in target, add them to "dependencies" by default
  KEYS_TO_SYNC.forEach((key) => {
    if (!foundKeys.has(key) && latestVersions[key]) {
      if (!targetPackageJson["dependencies"]) {
        targetPackageJson["dependencies"] = {};
      }
      changes.push(`➕ Added ${key} to dependencies: ${latestVersions[key]}`);
      targetPackageJson["dependencies"][key] = latestVersions[key];
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(TARGET_PACKAGE_JSON, JSON.stringify(targetPackageJson, null, 2));
    console.log(`✅ Synced dependencies from ${SOURCE_PACKAGE_JSON} to ${TARGET_PACKAGE_JSON}\n`);
    console.log("Changes:");
    changes.forEach(change => console.log(change));
  } else {
    console.log("✅ No updates needed (all versions are already correct).\n");
  }
}

// Run sync
syncDependencies();
