const SelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused
      ? 'grey' // Focused state border color
      : state.isSelected
      ? 'gray' // Selected state border color
      : 'grey', // Default border color
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    const selectedColor = '#043a57';  // Color for selected option
    const hoverColor = '#00639A';  // Hover background color

    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? selectedColor
        : isFocused
        ? hoverColor  // Hover background color
        : undefined,
      color: isDisabled
        ? '#ccc'
        : isSelected
        ? 'white'  // Text color for selected option
        : isFocused
        ? 'white'  // Text color on hover
        : 'black', // Regular text color
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled
          ? isSelected
            ? selectedColor
            : hoverColor // Hover active background color
          : undefined,
      },
    };
  },
  input: (styles) => ({
    ...styles,
    color: 'white',  // Text color inside input field
  }),
  placeholder: (styles) => ({
    ...styles,
    color: '#ccc',  // Placeholder color
  }),
  singleValue: (styles) => ({
    ...styles,
    color: '#043a57',  // Text color for the selected option
  }),
};

const srmTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  borderWidth: 1,
  color: 'red',
  colors: {
    ...theme.colors,
    primary25: '#00639A',  // Hover color for the select
    primary: 'silver',     // Primary color for the select
  },
});

export { srmTheme, SelectStyles };
