const fs = require('fs');
const path = require('path');

// Function to extract source from a source map
function extractSourceFromMap(jsFile, mapFile, outputFile) {
    try {
        // Read the source map
        const sourceMapContent = fs.readFileSync(mapFile, 'utf8');
        const sourceMap = JSON.parse(sourceMapContent);
        
        // Read the minified JS file
        const jsContent = fs.readFileSync(jsFile, 'utf8');
        
        console.log(`Processing: ${jsFile}`);
        console.log(`Source map: ${mapFile}`);
        console.log(`Output: ${outputFile}`);
        
        // Extract sources from the source map
        if (sourceMap.sources && sourceMap.sources.length > 0) {
            console.log(`Found ${sourceMap.sources.length} source files in the map`);
            
            // Create output directory if it doesn't exist
            const outputDir = path.dirname(outputFile);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            // Write the original sources
            sourceMap.sources.forEach((source, index) => {
                if (sourceMap.sourcesContent && sourceMap.sourcesContent[index]) {
                    const sourceContent = sourceMap.sourcesContent[index];
                    const sourcePath = path.join(outputDir, source);
                    
                    // Create directory for the source file
                    const sourceDir = path.dirname(sourcePath);
                    if (!fs.existsSync(sourceDir)) {
                        fs.mkdirSync(sourceDir, { recursive: true });
                    }
                    
                    fs.writeFileSync(sourcePath, sourceContent);
                    console.log(`Extracted: ${source}`);
                }
            });
            
            console.log(`\n✅ Successfully extracted sources to: ${outputDir}`);
        } else {
            console.log('❌ No sources found in the source map');
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${jsFile}:`, error.message);
    }
}

// Process all source maps
const sourceMaps = [
    {
        js: 'assets/javascripts/index.js',
        map: 'assets/javascripts/index.js.map',
        output: 'extracted-sources/index'
    },
    {
        js: 'assets/javascripts/contact/bundle.js',
        map: 'assets/javascripts/contact/bundle.js.map',
        output: 'extracted-sources/contact'
    },
    {
        js: 'assets/javascripts/financing/bundle.js',
        map: 'assets/javascripts/financing/bundle.js.map',
        output: 'extracted-sources/financing'
    },
    {
        js: 'assets/javascripts/multiunit/bundle.js',
        map: 'assets/javascripts/multiunit/bundle.js.map',
        output: 'extracted-sources/multiunit'
    },
    {
        js: 'assets/javascripts/tour/bundle.js',
        map: 'assets/javascripts/tour/bundle.js.map',
        output: 'extracted-sources/tour'
    },
    {
        js: 'assets/javascripts/configurator/bundle/index.js',
        map: 'assets/javascripts/configurator/bundle/index.js.map',
        output: 'extracted-sources/configurator'
    }
];

console.log('🔍 Extracting original source code from source maps...\n');

sourceMaps.forEach(({ js, map, output }) => {
    if (fs.existsSync(map)) {
        extractSourceFromMap(js, map, output);
        console.log(''); // Add spacing
    } else {
        console.log(`⚠️  Source map not found: ${map}`);
    }
});

console.log('🎉 Extraction complete!'); 