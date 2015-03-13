# Modules

* Components and views are ***modules***
* You can create, edit or remove modules using a prompt.

## Create a module

	$ gulp create_module

Will ask you

* If you want to create a ***component*** or a ***view***
* What you want the name of the module to be
* Which types of files you want the module to contain

Executing this command will

* Create a new directory with the given name in the components or views directory
* Copy the chosen types of files from the `_template` directory into the newly created directory
* Rename the copied files to match the module name (with the exception of `README.md`)
* Fill placeholder inside the copied files with the designated module type and name.
* If user chose to include a javascript file, include a jasmine test template.
* If user chose to include a javascript file, add a requirejs path alias to `amd-config.json`

> Entering the name of a module that already exists, will add files you choose to the
> files that are already in the module. No files will be overridden.