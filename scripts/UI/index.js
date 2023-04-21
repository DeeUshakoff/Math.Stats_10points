
function showData(data){
    document.getElementById("data").innerHTML=data;
}

function openFile(){
    let inputURL = document.getElementById("dataURL");
    let filePicker = document.getElementById("filePicker");

    if(filePicker.files.length > 0){
        openCSV(filePicker.files[0]);
        document.getElementById('data_content').style.display = 'flex';
        showSection('open_file_section');
        return;
    }
    if(inputURL.value !== '') {

        readURL(inputURL.value);
        showSection('open_file_section');
        if(document.getElementById('alert').style.display === 'flex')
        {
            document.getElementById('data_content').style.display = 'none';
            return;
        }

        document.getElementById('data_content').style.display = 'flex';
        return;
    }
    showAlert('Error', 'You have no picked file / URL \n Your bad :(');
}

function dataChanged(){
    let section = document.getElementById('open_file_section');

    let url = document.getElementById('dataURL');
    let filePicker = document.getElementById('filePicker');
    if((url.value != null && url.value != '') || (filePicker.value != null && filePicker.value != '')){
        section.style.display = 'flex';
    }
    else{
        section.style.display = 'none';
    }
}

function readURL(url)
{
    try{
        $.ajax({
            type: "GET",
            url: url,
            dataType: "text",
            success: function (data) {
                window.localStorage.setItem('csv', data.split(';').join(','));
                saveLocally();
            },
            error: function(data){
                showAlert(`Error`, data.responseText)
            }
        });
    }
    catch (e){
        showAlert(e,e);
    }

}

function removeAlert(){
    document.body.removeChild(document.getElementById('alert'));
}
function showAlert(title, message){

    let alert_container = document.createElement("section");
    alert_container.id = "alert";
    alert_container.style.display = 'flex';
    alert_container.className='blurred-alert-container'

    let alert_content_container = document.createElement("section");
    alert_content_container.className = "blurred-alert-content";

    let title_html = document.createElement("h1");
    title_html.innerHTML=title;

    let message_html = document.createElement("label");
    message_html.innerHTML = message;

    alert_content_container.appendChild(title_html);
    alert_content_container.appendChild(message_html);


    let remove_alert_button = document.createElement("button");
    remove_alert_button.onclick = removeAlert;
    remove_alert_button.className = "light-button no-select";
    remove_alert_button.style.marginTop = '15px';
    remove_alert_button.innerHTML = "Ok";
    alert_content_container.appendChild(remove_alert_button)

    alert_container.appendChild(alert_content_container);

    document.body.appendChild(alert_container);
}
function showSection(sectionID){
    let section = document.getElementById(sectionID);
    if (section.style.display === "none") {
        section.style.display = "flex";
    } else {
        section.style.display = "none";
    }
}

function addHeaderToList(headerName){
    let listItem = document.createElement("li");
    listItem.className = "csv-header-select-li no-select";
    listItem.innerText = headerName;
    listItem.addEventListener('click', function() {
        if( listItem.className === 'csv-header-select-li no-select') {
            listItem.className = 'csv-header-select-li no-select done';
        }
        else if( listItem.className === 'csv-header-select-li no-select done') {
            listItem.className = 'csv-header-select-li no-select';
        }
    }, false);

    document.getElementById('csv-headers-list').appendChild(listItem);
}

function addHeaderToHypoList(headerName, isSting){
    let listItem = document.createElement("option");
    listItem.innerText = headerName;
    
    if(isSting){
        listItem.disabled = true;
    }

    document.getElementById('csv-headers-list-hypo').appendChild(listItem);
}
function getSelectedColumns(){

    let selectedParams = [];

    let list = document.getElementById('csv-headers-list');
    list.childNodes.forEach(function(el) {
        if(el.className == 'csv-header-select-li no-select done'){
            selectedParams.push(el.innerText);
        }
    });

    let selectedData = [];

    selectedParams.forEach(function (el) {
        selectedData.push({data: getColumn(el), name: el});
    })
    
    window.localStorage.setItem('selectedData', JSON.stringify(selectedData));
    drawBoxPlot(selectedData);
    drawHistogram(selectedData);
}

function drawBoxPlot(inputData){

    // let trace1 = {
    //     y: inputData[0],
    //     type: 'box'
    // };

    // let trace2 = {
    //     y: inputData[1],
    //     type: 'box'
    // };


    // let data = [trace1, trace2];
    let data = [];
    for(let i = 0; i < inputData.length; i++){
        data.push(
            {
                y: inputData[i].data,
                type: 'box',
                name: inputData[i].name
            }
        )
    }

    Plotly.newPlot('plot', data);
}
function drawHistogram(inputData){
    let data = [];
    for(let i = 0; i < inputData.length; i++){
        //console.log(inputData[i].data);
        data.push(
            {
                x: inputData[i].data,
                type: 'histogram',
                name: inputData[i].name
            }
        )
    }
    let layout = {
        barmode: "stack",
        xaxis: {title: "Value"}, 
        yaxis: {title: "Frequency"}
    };
    Plotly.newPlot('hist', data, layout);
}

function drawHypothesis(inputData, hypo){
    if(inputData == null || hypo == null){
        showAlert("Warning", "Empty dataset or hypothesis");
        return;
    }

    if(typeof(inputData[0]) == String){
        showAlert("Warning", "Unnable to calculate with non-numetic dataset");
        return;
    }

    let result = checkHypothesis_ZTest(inputData, hypo);
    let result_label = document.getElementById('hypo_result');

    result_label.innerText = 'Result: '+ result;
}

function checkHypothesis_ZTest(inputData, hypo){
    let count = inputData.length;
    x = Number(0);
    inputData.forEach(element => {
        x += Number(element);
    })

    console.log('x ' + x + 'count ' + x/count);
    x /= count;

    // let stdStats = new Statistics(true);
    // let std = stdStats.standardDeviation(inputData);
    let std = standardDeviation(inputData);
    
    console.log(`μ: ${x}\nstd: ${std}`)
    let result = (x - hypo) / (std / Math.sqrt(count));

    return result;
}



function standardDeviation(inputData){
    let sum_0 = 0;
    inputData.forEach(element => {
        sum_0 += Number(element);
    })

    let mean = sum_0 / inputData.length;

    let sum = 0.0;
    inputData.forEach(i =>{
        sum += Math.pow(Number(i) - mean, 2);
    })
    let size = inputData.length - 1;
    return Math.sqrt(sum)/Math.sqrt(size);
}

function hypoChechButtonClicked(){
    let select = document.getElementById('csv-headers-list-hypo');
    let selected = select.options[select.selectedIndex];

    let input = document.getElementById('hypo_value');

    console.log(selected);

    if(selected === null){
        showAlert(":(", "Select one value to check");
        return;
    }
    if(input.value === null){
        showAlert(":(", "Input number to check");
        return;
    }

    drawHypothesis(getColumn(selected.text), input.value);
}
document.getElementById('hypo_check_button').addEventListener('click', hypoChechButtonClicked, false)