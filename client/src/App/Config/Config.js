class Config {
  static getConfig() {
    const appNode = document.getElementById('app');
    const config = JSON.parse(appNode.getAttribute('data-config'));
    return config;
  }
}
// TODO: halt if no rootfolderid

export default Config;
