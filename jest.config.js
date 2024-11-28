module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'], // Assuming your test files are in a __tests__ directory and end with .test.ts
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
