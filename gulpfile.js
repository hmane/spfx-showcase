'use strict';

const build = require('@microsoft/sp-build-web');
const path = require('path');
const fs = require('fs');
const { task } = require('gulp');
const del = require('del');

// Fast serve configuration
const { addFastServe } = require('spfx-fast-serve-helpers');

addFastServe(build, {
  serve: {
    open: false,
    port: 4321,
    https: true,
  },
});

// Suppress warnings
build.addSuppression(/Warning - \[sass\]/g);
build.addSuppression(/Warning - lint.*/g);

// MINIMAL webpack configuration - no code splitting to avoid manifest issues
build.configureWebpack.mergeConfig({
  additionalConfiguration: generatedConfiguration => {
    const isProduction = build.getConfig().production;

    // Path aliases only
    generatedConfiguration.resolve = generatedConfiguration.resolve || {};
    generatedConfiguration.resolve.alias = {
      ...generatedConfiguration.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    };

    if (isProduction) {
      // NO CODE SPLITTING - keep everything in single bundles
      generatedConfiguration.optimization = {
        ...generatedConfiguration.optimization,
        splitChunks: false, // Disable all code splitting
      };

      generatedConfiguration.devtool = 'source-map';
      console.log('🏗️  Production build - Single bundle mode (no code splitting)');
    } else {
      // Development mode
      generatedConfiguration.cache = {
        type: 'filesystem',
        cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
      };

      generatedConfiguration.devtool = 'eval-source-map';
      console.log('🔧 Development build - Fast compilation');
    }

    return generatedConfiguration;
  },
});

// Utility tasks
task('clean-cache', done => {
  const cacheDir = path.join(__dirname, 'node_modules/.cache');
  const tempDir = path.join(__dirname, 'temp');
  const distDir = path.join(__dirname, 'dist');

  [cacheDir, tempDir, distDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      del.sync([dir]);
      console.log(`✅ Cleared: ${path.basename(dir)}`);
    }
  });

  done();
});

task('list-bundles', done => {
  const distPath = path.join(__dirname, 'dist');

  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath).filter(file => file.endsWith('.js'));
    console.log(`📦 Generated bundles (${files.length}):`);
    files.forEach(file => {
      const stats = fs.statSync(path.join(distPath, file));
      console.log(`  - ${file} (${Math.round(stats.size / 1024)} KB)`);
    });
  } else {
    console.log('❌ No dist folder found');
  }

  done();
});

build.initialize(require('gulp'));
