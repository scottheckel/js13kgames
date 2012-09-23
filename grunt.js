module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['grunt.js', 'src/fish.js', 'src/menu.js', 'src/tt.js', 'src/game.js', 'src/gaim.js', 'src/util.js']
    },
    min: {
      'min/g.min.js' : ['src/gaim.js', 'src/util.js', 'src/tt.js', 'src/fish.js', 'src/menu.js', 'src/game.js']
    },

    mincss: {
      compress: {
        files: {
          'min/s.min.css' : 'src/s.css'
        }
      }
    },
    compress: {
      zip: {
        options: {
          mode: 'zip'
        },
        files: {
          'js13k.zip': ['min/g.min.js', 'min/s.min.css', 'min/index.html','min/*.png']
        }
      },
      zipWithAll : {
        options: {
          mode: 'zip'
        },
        files: {
          'js13k.all.zip': 'min/*'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-mincss');

  // Default task.
  grunt.registerTask('default', 'lint:all min mincss compress:zip compress:zipWithAll');

};