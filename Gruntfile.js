module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    uglify: {
      //distort variable names
      options: {
        mangle: {
          properties: false, //can cause scope error with redeclared variable names
          toplevel: false, //can cause scope error with redeclared variable names
          reserved: ["operation", "jQuery", "$"], // Exclude mangling specific names.
        },
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
