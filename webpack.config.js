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
    filename: 'build-app-with.cjs',
    library: {
      type: 'commonjs2'
    }
  },
  externals: {
    // Keep npm packages as external dependencies
    'inquirer': 'commonjs inquirer',
    'fs-extra': 'commonjs fs-extra',
    'execa': 'commonjs execa',
    'chalk': 'commonjs chalk',
    'ora': 'commonjs ora'
  },
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