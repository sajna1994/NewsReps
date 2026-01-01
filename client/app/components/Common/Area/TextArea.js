import React from 'react';
import { FormGroup, Label, Input, FormFeedback } from 'reactstrap';

const TextArea = props => {
    const {
        className,
        id,
        label,
        name,
        placeholder,
        value,
        error,
        rows,
        onInputChange
    } = props;

    const handleChange = event => {
        const { value } = event.target;
        onInputChange(name, value);
    };

    return (
        <FormGroup className={className}>
            {label && <Label for={id}>{label}</Label>}
            <Input
                id={id}
                name={name}
                type="textarea"
                rows={rows || 3}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                invalid={error ? true : false}
            />
            {error && <FormFeedback>{error}</FormFeedback>}
        </FormGroup>
    );
};

export default TextArea;