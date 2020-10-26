export default function OnFlagError(event, region) {
  const { target } = event;
  const filename = `${region.iso.toLowerCase()}_3x.png`;
  const websiteFlag = `https://www.privateinternetaccess.com/images/flags/${filename}`;

  if (target.getAttribute('src') !== websiteFlag) {
    target.setAttribute('src', websiteFlag);
  }
}
