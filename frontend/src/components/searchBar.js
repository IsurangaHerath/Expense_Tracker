import React,{useState,useEffect,useRef} from 'react';
import './SearchBar.css'

const SearchBar=({onSearch,placeholder ="Search expenses..."}) => {
    const [value, setValue]=useState('');
    const[isSearching, setIsSearching]=useState(false);
    const debounceTimer=useRef(null);

    const handleChange = (e) =>{
        const query=e.target.value;
        setValue(query);
        setIsSearching(true);
    

    if(debounceTimer.current){
        clearTimeout(debounceTimer.current);
    }

    debounceTimer.current=setTimeout(() =>{
        onSearch(query);
        setIsSearching(false);

    }, 300);

};

const handleClear = () =>{
    setValue('');
    if(debounceTimer.current){
        clearTimeout(debounceTimer.current);
    }
    setIsSearching(false);
    onSearch('');
};

useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);


  return (
    <div className="search-bar-container">
      
      <span className="search-icon">&#128269;</span>

      
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input"
      />

      <div className="action-container">
        {isSearching ? (
            <span className="spinner"></span>
        ) : value ? (
            <button 
            type="button" 
            onClick={handleClear} 
            className="clear-button"
            aria-label="Clear search"
            >
                &#10005;
          </button>
        ) : null}
        </div>
    </div>
    );
};

export default SearchBar;
