module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    uglify: {
      //just remove comments, but don't distort variable names, as this can cause app review to take longer by chrome extension
      options: {
        mangle: false,
        preserveComments: true,
      },
      //uglify chrome extension files
      build: {
        src: ["**/*.js", "!**/*.min.js"],
        cwd: "dist/extension/chrome/",
        dest: "dist/extension/chrome/",
        expand: true,
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks("grunt-contrib-uglify");

  // Default task(s).
  grunt.registerTask("default", ["uglify"]);

  //TODO: use git compress in production to turn dist/extension into a zip file to easily be uploaded
};
