function openCSV(file) {
    window.localStorage.setItem('csv', null);
    let reader = new FileReader();

    reader.onload = function (){
        window.localStorage.setItem('csv', reader.result.split(';').join(','));
        saveLocally();
    }
    reader.readAsText(file);
}

function saveLocally(){
    let fileData = [];
    fileData = $.csv.toArrays(window.localStorage.getItem('csv'));

    document.getElementById('csv-headers-list').innerHTML = null;
    document.getElementById('csv-headers-list-hypo').innerHTML = null;

    let column = 0;

    for(let i = 0; i < fileData[0].length; i++){
        addHeaderToList(fileData[0][i]);

        addHeaderToHypoList(fileData[0][i], isNaN(+fileData[1][i]));
        
    }
    // fileData[0].forEach(el => {
    //     addHeaderToList(el);
        
    // });


}

function getColumn(columnName){

    let array = $.csv.toArrays(window.localStorage.getItem('csv'));
    let columnIndex = array[0].indexOf(columnName);

    if(columnIndex === -1){
        return;
    }
    let column = [array.length-1];
    for (let i = 1; i < array.length; i++){
        column[i-1] = array[i][columnIndex];
    }
    //console.log(column);
    return column;
}
