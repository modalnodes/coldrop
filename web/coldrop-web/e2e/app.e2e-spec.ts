import { ColdropWebPage } from './app.po';

describe('coldrop-web App', function() {
  let page: ColdropWebPage;

  beforeEach(() => {
    page = new ColdropWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
