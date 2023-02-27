import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export class Dropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      selectedValue: props.defaultSelectedValue || '',
    };
  }

  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  handleSelect = (value) => {
    this.props.onSelect(value);
    this.setState({
      selectedValue: value,
      isOpen: false,
    });
  };

  render() {
    const { options, label } = this.props;
    const { isOpen, selectedValue } = this.state;

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={this.toggleDropdown}
        >
          <Text style={styles.dropdownHeaderText}>
            {label}: {selectedValue}
          </Text>
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.dropdownContent}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownOption}
                onPress={() => this.handleSelect(option)}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 10,
  },
  dropdownHeader: {
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  dropdownHeaderText: {
    fontSize: 16,
  },
  dropdownContent: {
    backgroundColor: '#fff',
    padding: 10,
  },
  dropdownOption: {
    padding: 5,
  },
  dropdownOptionText: {
    fontSize: 16,
  },
});
