import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  target: 'node',
  mode: 'production',
  entry: './src/create-app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'build-app-with.mjs',
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true
  },
  externals: [
    'inquirer',
    'fs-extra',
    'execa',
    'chalk',
    'ora'
  ],
  resolve: {
    extensions: ['.js', '.json'],
    modules: ['node_modules', 'src'],
    fullySpecified: false // Handle ES modules properly
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        type: 'javascript/esm'
      }
    ]
  },
  optimization: {
    minimize: false // Keep readable for debugging
  },
  stats: 'minimal'
};