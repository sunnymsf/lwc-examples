const Navigate = Symbol('Navigate');
const GenerateUrl = Symbol('GenerateUrl');

const navigateMock = jest.fn();
const generateUrlMock = jest.fn(() => {
    return Promise.resolve('https://mock-url');
});
export const NavigationMixin = (Base) => {
    return class extends Base {
        [Navigate](pageReference, replace) {
            navigateMock(pageReference, replace);
        }

        [GenerateUrl](pageReference) {
            return generateUrlMock(pageReference);
        }
    };
};
NavigationMixin.Navigate = Navigate;
NavigationMixin.GenerateUrl = GenerateUrl;
export { navigateMock, generateUrlMock };
