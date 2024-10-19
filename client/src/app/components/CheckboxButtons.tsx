import { FormControlLabel, Checkbox, FormGroup } from "@mui/material";
import { useState } from "react";

interface Props {
    items: string[];
    checked?: string[];
    onChange: (items: string[]) => void;
}

export default function CheckboxButtons({items, checked, onChange}: Props){
    const [checkedItems, setCheckedItems] = useState(checked  || []);
    
    function handleChecked(value: string){
        const currentIndex = checked?.findIndex(item => item === value);

        let newChecked: string[] = checked?.slice() || [];
        
        if(currentIndex === -1 || currentIndex === undefined){
            newChecked = [...newChecked, value];
        } else {
            newChecked = checkedItems.filter(item => item != value)
        }

        setCheckedItems(newChecked);
        onChange(newChecked);
    }

    return (
        <FormGroup>
            {items.map(item => <FormControlLabel 
                control={<Checkbox 
                    checked={ checked != undefined && checked.includes(item) }
                    onClick={ () => handleChecked(item) }
                />} 
                label={item} 
                key={item} />)}
        </FormGroup>
    );
}