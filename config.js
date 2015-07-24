// Paths for all common dirs, change to fit your needs
export const paths = {
  src: './src',
  dist: './dist'
};
paths.assets = {
  src: paths.src + '/assets',
  dist: paths.dist + '/assets'
};
paths.scripts = {
  src: paths.assets.src + '/scripts',
  dist: paths.assets.dist + '/scripts'
};
paths.styles = {
  src: paths.assets.src + '/styles',
  dist: paths.assets.dist + '/styles'
};
paths.media = {
  src: paths.assets.src + '/media',
  dist: paths.assets.dist + '/media'
};
paths.fonts = {
  src: paths.assets.src + '/fonts',
  dist: paths.assets.dist + '/fonts'
};
paths.sources = paths.assets.src + '/sources';
paths.favicons = paths.media.dist + '/favicons/';
