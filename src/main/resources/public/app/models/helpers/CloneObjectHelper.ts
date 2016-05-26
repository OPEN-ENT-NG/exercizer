class CloneObjectHelper {
    static clone( originalObject , circular ) {
        // First create an empty object with
        // same prototype of our original source

        var propertyIndex, descriptor, keys, current, nextSource, indexOf,
            copies = [{source: originalObject, target: Object.create(Object.getPrototypeOf(originalObject))}],
            cloneObject = copies[0].target,
            sourceReferences = [originalObject],
            targetReferences = [cloneObject];

        // First in, first out
        while (current = copies.shift())	// jshint ignore:line
        {
            keys = Object.getOwnPropertyNames(current.source);

            for (propertyIndex = 0; propertyIndex < keys.length; propertyIndex++) {

                // Save the source's descriptor
                descriptor = Object.getOwnPropertyDescriptor(current.source, keys[propertyIndex]);

                // angular hack
                if (keys[propertyIndex] === '$$hashKey') {
                    continue;
                }

                if (!descriptor.value || typeof descriptor.value !== 'object') {
                    Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                    continue;
                }

                nextSource = descriptor.value;
                descriptor.value = Array.isArray(nextSource) ? [] : Object.create(Object.getPrototypeOf(nextSource));

                if (circular) {
                    indexOf = sourceReferences.indexOf(nextSource);

                    if (indexOf !== -1) {
                        // The source is already referenced, just assign reference
                        descriptor.value = targetReferences[indexOf];
                        Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                        continue;
                    }

                    sourceReferences.push(nextSource);
                    targetReferences.push(descriptor.value);
                }

                Object.defineProperty(current.target, keys[propertyIndex], descriptor);

                copies.push({source: nextSource, target: descriptor.value});
            }
        }

        return cloneObject;
    }
}