import React, { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { cdnPrefix } from '../../config/urls';
import './SearchInput.css';

const SearchInput = (props) => {
    const { onChange } = props
    const [val, setVal] = useState('')

    const foo = useDebouncedCallback(
        (keyword) => {
            onChange(keyword)
        },
        500
    );

    return <div className="SearchInputWrapper">
        <input placeholder='Search' className="SearchInput" id={'search-input'} onChange={e => {
            foo(e.target.value)
            setVal(e.target.value)
        }} />
        <img src={cdnPrefix + "search.svg"} className="SearchInputIcon" alt="Search" onClick={() => foo(val)} />
    </div>
}

export default SearchInput