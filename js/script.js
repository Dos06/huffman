function uploadFile() {
    let fileText = '';
    let file = document.getElementById("file").files[0];
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function(){
        fileText = reader.result.replace(/ +(?= )/g, '');

        let probabilities = getProbabilities(fileText);
        addResult(probabilities);
    }

    const arr = [fileText].map(char => char.charCodeAt(0));
    document.getElementById('result').value = arr;
}

function getProbabilities(fileText) {
    let dict = new Object();

    for (let i = 0; i < fileText.length; i++){
        let key = fileText.charAt(i);
        if (!(key in dict)) {
            dict[key] = 1; 
        } else {
            let value = dict[key];
            dict[key] = value + 1;
        }
    }

    for (let key in dict) {
        let value = dict[key];
        dict[key] = Math.round((value / fileText.length) * Math.pow(10, 2)) / Math.pow(10, 2);
        
    }
    return dict;
}

function addResult(result) {
    document.getElementById('result').innerHTML = JSON.stringify(result);
}
