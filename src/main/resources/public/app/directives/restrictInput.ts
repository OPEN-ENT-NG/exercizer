directives.push(
    {
        name: 'restrictInput',
        injections: [ () => {
            return {
                restrict: 'A',
                link:(scope:any, element:any, attrs:any) => {
                    var inputElement = element[0],
                        inputValue = inputElement.value,
                        regex = RegExp(attrs['restrictInput']);

                    inputElement.addEventListener('keyup', function() {

                        inputElement.value.replace(/\s/g, '');
                        // FIXME
                        if (regex.test(inputElement.value) || inputElement.value.length === 0) {
                            inputValue = inputElement.value;
                        } else {
                            inputElement.value = inputValue;
                        }
                    });

                }
            };
        }]
    }
);