const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking dependencies for the map functionality...');

// Check if package.json exists
if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  console.error('Error: package.json not found. Make sure you are in the project root directory.');
  process.exit(1);
}

// Helper function to check if a package is installed
function isPackageInstalled(packageName) {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return !!deps[packageName];
  } catch (error) {
    console.error(`Error checking if ${packageName} is installed:`, error);
    return false;
  }
}

// Define required packages
const requiredPackages = [
  'leaflet',
  'react-leaflet',
  '@types/leaflet'
];

// Check which packages need to be installed
const packagesToInstall = requiredPackages.filter(pkg => !isPackageInstalled(pkg));

// Install missing packages
if (packagesToInstall.length > 0) {
  console.log(`Installing missing packages: ${packagesToInstall.join(', ')}`);
  try {
    // Detect package manager
    let packageManager = 'npm';
    if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
      packageManager = 'yarn';
    } else if (fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    }

    // Install packages with the detected package manager
    if (packageManager === 'npm') {
      execSync(`npm install ${packagesToInstall.join(' ')}`, { stdio: 'inherit' });
    } else if (packageManager === 'yarn') {
      execSync(`yarn add ${packagesToInstall.join(' ')}`, { stdio: 'inherit' });
    } else if (packageManager === 'pnpm') {
      execSync(`pnpm add ${packagesToInstall.join(' ')}`, { stdio: 'inherit' });
    }
    console.log('All required packages installed successfully!');
  } catch (error) {
    console.error('Error installing packages:', error);
    console.log('Please manually install the following packages:');
    console.log(`  ${packagesToInstall.join('\n  ')}`);
  }
} else {
  console.log('All required map dependencies are already installed!');
}

console.log('\nNext steps:');
console.log('1. Make sure to rebuild the application after installing dependencies');
console.log('2. If running in production, use "npm run build" followed by "npm start"');
console.log('3. For development, use "npm run dev"'); 