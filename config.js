import path from 'path';

// Paths for all common dirs, change to fit your needs
const paths = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
};
paths.public = path.join(paths.dist, 'public');
paths.assets = {
  src: path.join(paths.src, 'assets'),
  dist: path.join(paths.dist, 'assets'),
};
paths.scripts = {
  src: path.join(paths.assets.src, 'scripts'),
  dist: path.join(paths.assets.dist, 'scripts'),
};
paths.styles = {
  src: path.join(paths.assets.src, 'styles'),
  dist: path.join(paths.assets.dist, 'styles'),
};
paths.media = {
  src: path.join(paths.assets.src, 'media'),
  dist: path.join(paths.assets.dist, 'media'),
};
paths.fonts = {
  src: path.join(paths.assets.src, 'fonts'),
  dist: path.join(paths.assets.dist, 'fonts'),
};
paths.sources = path.join(paths.assets.src, 'sources');
paths.favicons = path.join(paths.media.dist, 'favicons/');

// Bundles for browserify
const bundles = [
  {
    entries: [path.join(paths.scripts.src, 'main.js')],
    output: 'main.min.js',
    extensions: ['.js', '.json'],
    destination: paths.scripts.dist
  }
];

export {
  paths,
  bundles,
};
