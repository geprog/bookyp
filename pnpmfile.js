function readPackage(pkg, context) {
  // Override the manifest of foo@1.x after downloading it from the registry
  if (pkg.name === '@jest/transform' && pkg.version.startsWith('27.0.0')) {
    pkg.dependencies = {
      ...pkg.dependencies,
      'jest-runner': '27.0.0-next.5',
    };
    context.log('add jest-runner@27.0.0-next.5 to dependencies of @jest/transform');
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
