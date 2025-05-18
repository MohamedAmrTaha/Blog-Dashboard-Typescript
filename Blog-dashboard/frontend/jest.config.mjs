export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  setupFilesAfterEnv: [
    "./jest.setup.ts",
    "@testing-library/jest-dom"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};