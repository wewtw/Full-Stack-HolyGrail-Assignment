// PlusMinus component that renders two images (plus and minus) for a given section and calls a parent function when clicked to update the database value for that section
function PlusMinus(props){
    // handle function that updates the database value based on the button that was clicked
    function handle(e){
        // check if minus button was clicked
        if(e.target.id.includes('minus')){
            // call parent function with a value of -1 to decrement the value for this section
            props.handle({name:props.section, value: -1});
            return;    
        }
        // call parent function with a value of 1 to increment the value for this section
        props.handle({name:props.section, value: 1});    
    }
    // render plus and minus buttons for this section
    return (<>
        <img src={`icons/${props.section}_plus.png`} id="plus" onClick={((e) => handle(e))}/>
        <img src={`icons/${props.section}_minus.png`} id="minus" onClick={((e) => handle(e))}/>
    </>);
}

// Data component that renders the current database values for all sections
function Data(props){
    // render the current database values for all sections
    return (<div>
        Header:  {props.data.header}, 
        Left:    {props.data.left}, 
        Article: {props.data.article}, 
        Right:   {props.data.right}, 
        Footer:  {props.data.footer}
    </div>);
}

// function that makes a GET request to update a database value for a given section by a given amount
function update(section, value) {
    // create a promise that resolves with the updated database values if the request was successful
    return new Promise((resolve, reject) => {
        var url = `/update/${section}/${value}`;        
        superagent
            .get(url)
            .end(function(err, res){
                err ? reject(null) : resolve(res.body);
            });
    });
}

// function that makes a GET request to retrieve the current database values for all sections
function read() {
    // create a promise that resolves with the current database values if the request was successful
    return new Promise((resolve, reject) => {
        var url = '/data';
        superagent
            .get(url)
            .end(function(err, res){
                err ? reject(null) : resolve(res.body);
            });
    });
}

// main App component that renders all sections, reads the current database values on mount, and updates the database values when a PlusMinus component is clicked
function App(){
    // state variable to hold the current database values
    const [data, setData]   = React.useState({header:0,left:0,article:0,right:0,footer:0});    

    // useEffect hook to read the current database values on mount and update the UI with them
    React.useEffect(() => {
        // read db data & update UI
        const response = read()
            .then(res => {
                setData(res)
        });        
    }, []);

    // handle function that updates the database value for a given section and updates the local state with the new values
    function handle(section){
        // update db & local state
        const response = update(section.name, section.value)
            .then(res => {
                setData(res)
            });
    }

    // render all sections with their current values and PlusMinus buttons
    return (<>
        <div className="grid">        
            <Header  handle={handle} data={data}/>
            <Left    handle={handle} data={data}/>
            <Article handle={handle} data={data}/>
            <Right   handle={handle} data={data}/>
            <Footer  handle={handle} data={data}/>
        </div>
    </>);
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
