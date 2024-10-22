const fs = require('fs');
const { PNG } = require('pngjs');

const gltfFilePath = './files/sample.gltf';


gltfToPng(gltfFilePath, "./files/sample.png");

function sortFloat(a, b) { return a - b; }

function gltfToPng(gltfPath, pngPath) {
    fs.readFile(gltfPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading glTF file 😡:', err);
            return;
        }
        const data_json = JSON.parse(data);
        const decodedBase64 = Buffer.from(data_json.buffers[0].uri.split(',')[1], 'base64');


        // 3 comes from vec3, 4 comes from float32
        const offset = 3 * 4;
        const min = data_json.accessors[0].min[1];
        const max = data_json.accessors[0].max[1];
        const gap = max - min;
        if (gap === 0) {
            console.log("Hey! this is just a plane, import a terrain 😡")
            return;
        }
        const count = data_json.accessors[0].count;

        let xIndices = [];
        let zIndices = [];

        for (let i = 0; i < count; i++) {
            const currentOffset = i * offset;
            let x = decodedBase64.readFloatLE(currentOffset);
            let z = decodedBase64.readFloatLE(currentOffset + 8);
            if (!xIndices.includes(x)) {
                xIndices.push(x);
            }
            if (!zIndices.includes(z)) {
                zIndices.push(z);
            }
        }
        xIndices.sort(sortFloat);
        zIndices.sort(sortFloat);
        let dataArr = new Array(xIndices.length);
        for (let i = 0; i < dataArr.length; i++) {
            dataArr[i] = new Array(zIndices.length);
        }
        const png = new PNG({
            width: xIndices.length,
            height: zIndices.length,
            colorType: 0,   // Grayscale
            inputColorType: 0,
            bitDepth: 8,
        });
        for (let i = 0; i < count; i++) {
            const currentOffset = i * offset;
            let x = decodedBase64.readFloatLE(currentOffset);
            let y = decodedBase64.readFloatLE(currentOffset + 4);
            let z = decodedBase64.readFloatLE(currentOffset + 8);
            y = y - min;
            y = y / gap;
            y = ~~(y * 255);
            const currentX_Index = xIndices.indexOf(x);
            const currentZ_Index = zIndices.indexOf(z);
            dataArr[currentX_Index][currentZ_Index] = y;
        }

        for (let z = 0; z < zIndices.length; z++) {
            for (let x = 0; x < xIndices.length; x++) {
                const idx = (xIndices.length * z + x); // Index
                png.data[idx] = dataArr[z][x];
            }
        }

        png.pack().pipe(fs.createWriteStream(pngPath)).on('finish', () => {
            console.log(`PNG file created: ${pngPath} 🥰`);
        });

        console.log(dataArr);
    })
}