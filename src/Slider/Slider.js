import React, {Component, PropTypes} from 'react';
import keycode from 'keycode';
import transitions from '../styles/transitions';
import FocusRipple from '../internal/FocusRipple';

/**
 * Verifies min/max range.
 * @param   {Object} props         Properties of the React component.
 * @param   {String} propName      Name of the property to validate.
 * @param   {String} componentName Name of the component whose property is being validated.
 * @returns {Object} Returns an Error if min >= max otherwise null.
 */
const minMaxPropType = (props, propName, componentName) => {
  const error = PropTypes.number(props, propName, componentName);
  if (error !== null) return error;

  if (props.min >= props.max) {
    const errorMsg = (propName === 'min') ? 'min should be less than max' : 'max should be greater than min';
    return new Error(errorMsg);
  }
};

/**
 * Verifies value is within the min/max range.
 * @param   {Object} props         Properties of the React component.
 * @param   {String} propName      Name of the property to validate.
 * @param   {String} componentName Name of the component whose property is being validated.
 * @returns {Object} Returns an Error if the value is not within the range otherwise null.
 */
const valueInRangePropType = (props, propName, componentName) => {
  const error = PropTypes.number(props, propName, componentName);
  if (error !== null) return error;

  const value = props[propName];
  if (value < props.min || props.max < value) {
    return new Error(`${propName} should be within the range specified by min and max`);
  }
};

const getStyles = (props, context, state) => {
  const {slider} = context.muiTheme;
  const fillGutter = slider.handleSize / 2;
  const disabledGutter = slider.trackSize + slider.handleSizeDisabled / 2;
  const calcDisabledSpacing = props.disabled ? ` - ${disabledGutter}px` : '';

  const styles = {
    slider: {
      touchCallout: 'none',
      userSelect: 'none',
      cursor: 'default',
      height: slider.handleSizeActive,
      position: 'relative',
      marginTop: 24,
      marginBottom: 48,
    },
    track: {
      position: 'absolute',
      top: (slider.handleSizeActive - slider.trackSize) / 2,
      left: 0,
      width: '100%',
      height: slider.trackSize,
    },
    filledAndRemaining: {
      position: 'absolute',
      top: 0,
      height: '100%',
      transition: transitions.easeOut(null, 'margin'),
    },
    handle: {
      boxSizing: 'border-box',
      position: 'absolute',
      cursor: 'pointer',
      pointerEvents: 'inherit',
      top: 0,
      left: state.percent === 0 ? '0%' : `${(state.percent * 100)}%`,
      zIndex: 1,
      margin: `${(slider.trackSize / 2)}px 0 0 0`,
      width: slider.handleSize,
      height: slider.handleSize,
      backgroundColor: slider.selectionColor,
      backgroundClip: 'padding-box',
      border: '0px solid transparent',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      transition:
        `${transitions.easeOut('450ms', 'background')}, ${
        transitions.easeOut('450ms', 'border-color')}, ${
        transitions.easeOut('450ms', 'width')}, ${
        transitions.easeOut('450ms', 'height')}`,
      overflow: 'visible',
      outline: 'none',
    },
    handleWhenDisabled: {
      boxSizing: 'content-box',
      cursor: 'not-allowed',
      backgroundColor: slider.trackColor,
      width: slider.handleSizeDisabled,
      height: slider.handleSizeDisabled,
      border: 'none',
    },
    handleWhenPercentZero: {
      border: `${slider.trackSize}px solid ${slider.handleColorZero}`,
      backgroundColor: slider.handleFillColor,
      boxShadow: 'none',
    },
    handleWhenPercentZeroAndDisabled: {
      cursor: 'not-allowed',
      width: slider.handleSizeDisabled,
      height: slider.handleSizeDisabled,
    },
    handleWhenPercentZeroAndFocused: {
      border: `${slider.trackSize}px solid ${slider.trackColorSelected}`,
    },
    handleWhenActive: {
      width: slider.handleSizeActive,
      height: slider.handleSizeActive,
    },
    ripple: {
      height: slider.handleSize,
      width: slider.handleSize,
      overflow: 'visible',
    },
    rippleWhenPercentZero: {
      top: -slider.trackSize,
      left: -slider.trackSize,
    },
    rippleInner: {
      height: '300%',
      width: '300%',
      top: -slider.handleSize,
      left: -slider.handleSize,
    },
    rippleColor: {
      fill: state.percent === 0 ? slider.handleColorZero : slider.rippleColor,
    },
  };
  styles.filled = Object.assign({}, styles.filledAndRemaining, {
    left: 0,
    backgroundColor: (props.disabled) ? slider.trackColor : slider.selectionColor,
    marginRight: fillGutter,
    width: `calc(${(state.percent * 100)}%${calcDisabledSpacing})`,
  });
  styles.remaining = Object.assign({}, styles.filledAndRemaining, {
    right: 0,
    backgroundColor: (state.hovered || state.focused) &&
      !props.disabled ? slider.trackColorSelected : slider.trackColor,
    marginLeft: fillGutter,
    width: `calc(${((1 - state.percent) * 100)}%${calcDisabledSpacing})`,
  });

  return styles;
};

class Slider extends Component {
  static propTypes = {
    /**
     * The default value of the slider.
     */
    defaultValue: valueInRangePropType,
    /**
     * Describe the slider.
     */
    description: PropTypes.string,
    /**
     * Disables focus ripple if set to true.
     */
    disableFocusRipple: PropTypes.bool,
    /**
     * If true, the slider will not be interactable.
     */
    disabled: PropTypes.bool,
    /**
     * An error message for the slider.
     */
    error: PropTypes.string,
    /**
     * The maximum value the slider can slide to on
     * a scale from 0 to 1 inclusive. Cannot be equal to min.
     */
    max: minMaxPropType,
    /**
     * The minimum value the slider can slide to on a scale
     * from 0 to 1 inclusive. Cannot be equal to max.
     */
    min: minMaxPropType,
    /**
     * The name of the slider. Behaves like the name attribute
     * of an input element.
     */
    name: PropTypes.string,
    /**
     * Callback function that is fired when the focus has left the slider.
     */
    onBlur: PropTypes.func,
    /**
     * Callback function that is fired when the user changes the slider's value.
     */
    onChange: PropTypes.func,
    /**
     * Callback function that is fired when the slider has begun to move.
     */
    onDragStart: PropTypes.func,
    /**
     * Callback function that is fried when the slide has stopped moving.
     */
    onDragStop: PropTypes.func,
    /**
     * Callback fired when the user has focused on the slider.
     */
    onFocus: PropTypes.func,
    /**
     * Whether or not the slider is required in a form.
     */
    required: PropTypes.bool,
    /**
     * The granularity the slider can step through values.
     */
    step: PropTypes.number,
    /**
     * Override the inline-styles of the root element.
     */
    style: PropTypes.object,
    /**
     * The value of the slider.
     */
    value: valueInRangePropType,
  };

  static defaultProps = {
    disabled: false,
    disableFocusRipple: false,
    max: 1,
    min: 0,
    required: true,
    step: 0.01,
    style: {},
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    active: false,
    dragging: false,
    focused: false,
    hovered: false,
    percent: 0,
    value: 0,
  };

  componentWillMount() {
    let value = this.props.value;
    if (value === undefined) {
      value = this.props.defaultValue !== undefined ? this.props.defaultValue : this.props.min;
    }
    let percent = (value - this.props.min) / (this.props.max - this.props.min);
    if (isNaN(percent)) percent = 0;

    this.setState({
      percent: percent,
      value: value,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== undefined && !this.state.dragging) {
      this.setValue(nextProps.value);
    }
  }

  onHandleTouchStart = (event) => {
    if (document) {
      document.addEventListener('touchmove', this.dragTouchHandler, false);
      document.addEventListener('touchup', this.dragTouchEndHandler, false);
      document.addEventListener('touchend', this.dragTouchEndHandler, false);
      document.addEventListener('touchcancel', this.dragTouchEndHandler, false);
    }
    this.onDragStart(event);

    // Cancel scroll and context menu
    event.preventDefault();
  };

  onHandleMouseDown = (event) => {
    if (document) {
      document.addEventListener('mousemove', this.dragHandler, false);
      document.addEventListener('mouseup', this.dragEndHandler, false);

      // Cancel text selection
      event.preventDefault();

      // Set focus manually since we called preventDefault()
      this.refs.handle.focus();
    }
    this.onDragStart(event);
  };

  onHandleKeyDown = (event) => {
    const {min, max, step} = this.props;
    let action;

    switch (keycode(event)) {
      case 'page down':
      case 'left':
      case 'down':
        action = 'decrease';
        break;
      case 'page up':
      case 'right':
      case 'up':
        action = 'increase';
        break;
      case 'home':
        action = 'home';
        break;
      case 'end':
        action = 'end';
        break;
    }

    if (action) {
      let newValue;
      let newPercent;

      // Cancel scroll
      event.preventDefault();

      // When pressing home or end the handle should be taken to the
      // beginning or end of the track respectively
      switch (action) {
        case 'decrease':
          newValue = Math.max(min, this.state.value - step);
          newPercent = (newValue - min) / (max - min);
          break;
        case 'increase':
          newValue = Math.min(max, this.state.value + step);
          newPercent = (newValue - min) / (max - min);
          break;
        case 'home':
          newValue = min;
          newPercent = 0;
          break;
        case 'end':
          newValue = max;
          newPercent = 1;
          break;
      }

      // We need to use toFixed() because of float point errors.
      // For example, 0.01 + 0.06 = 0.06999999999999999
      if (this.state.value !== newValue) {
        this.setState({
          percent: newPercent,
          value: parseFloat(newValue.toFixed(5)),
        }, () => {
          if (this.props.onChange) this.props.onChange(event, this.state.value);
        });
      }
    }
  };

  dragHandler = (event) => {
    if (this.dragRunning) {
      return;
    }
    this.dragRunning = true;
    requestAnimationFrame(() => {
      this.onDragUpdate(event, event.clientX - this.getTrackLeft());
      this.dragRunning = false;
    });
  };

  dragTouchHandler = (event) => {
    if (this.dragRunning) {
      return;
    }
    this.dragRunning = true;
    requestAnimationFrame(() => {
      this.onDragUpdate(event, event.touches[0].clientX - this.getTrackLeft());
      this.dragRunning = false;
    });
  };

  dragEndHandler = (event) => {
    if (document) {
      document.removeEventListener('mousemove', this.dragHandler, false);
      document.removeEventListener('mouseup', this.dragEndHandler, false);
    }

    this.onDragStop(event);
  };

  dragTouchEndHandler = (event) => {
    if (document) {
      document.removeEventListener('touchmove', this.dragTouchHandler, false);
      document.removeEventListener('touchup', this.dragTouchEndHandler, false);
      document.removeEventListener('touchend', this.dragTouchEndHandler, false);
      document.removeEventListener('touchcancel', this.dragTouchEndHandler, false);
    }

    this.onDragStop(event);
  };

  getValue() {
    return this.state.value;
  }

  setValue(i) {
    // calculate percentage
    let percent = (i - this.props.min) / (this.props.max - this.props.min);
    if (isNaN(percent)) percent = 0;
    // update state
    this.setState({
      value: i,
      percent: percent,
    });
  }

  getPercent() {
    return this.state.percent;
  }

  setPercent(percent, callback) {
    const value = this.alignValue(this.percentToValue(percent));
    const {min, max} = this.props;
    const alignedPercent = (value - min) / (max - min);
    if (this.state.value !== value) {
      this.setState({value: value, percent: alignedPercent}, callback);
    }
  }

  clearValue() {
    this.setValue(this.props.min);
  }

  alignValue(val) {
    const {step, min} = this.props;
    const alignValue = Math.round((val - min) / step) * step + min;
    return parseFloat(alignValue.toFixed(5));
  }

  handleTouchStart = (event) => {
    if (!this.props.disabled && !this.state.dragging) {
      const pos = event.touches[0].clientX - this.getTrackLeft();
      this.dragX(event, pos);

      // Since the touch event fired for the track and handle is child of
      // track, we need to manually propagate the event to the handle.
      this.onHandleTouchStart(event);
    }
  };

  handleFocus = (event) => {
    this.setState({focused: true});
    if (this.props.onFocus) this.props.onFocus(event);
  };

  handleBlur = (event) => {
    this.setState({focused: false, active: false});
    if (this.props.onBlur) this.props.onBlur(event);
  };

  handleMouseDown = (event) => {
    if (!this.props.disabled && !this.state.dragging) {
      const pos = event.clientX - this.getTrackLeft();
      this.dragX(event, pos);

      // Since the click event fired for the track and handle is child of
      // track, we need to manually propagate the event to the handle.
      this.onHandleMouseDown(event);
    }
  };

  handleMouseUp = () => {
    if (!this.props.disabled) this.setState({active: false});
  };

  handleMouseEnter = () => {
    this.setState({hovered: true});
  };

  handleMouseLeave = () => {
    this.setState({hovered: false});
  };

  getTrackLeft() {
    return this.refs.track.getBoundingClientRect().left;
  }

  onDragStart(event) {
    this.setState({
      dragging: true,
      active: true,
    });
    if (this.props.onDragStart) this.props.onDragStart(event);
  }

  onDragStop(event) {
    this.setState({
      dragging: false,
      active: false,
    });
    if (this.props.onDragStop) this.props.onDragStop(event);
  }

  onDragUpdate(event, pos) {
    if (!this.state.dragging) return;
    if (!this.props.disabled) this.dragX(event, pos);
  }

  dragX(event, pos) {
    const max = this.refs.track.clientWidth;
    if (pos < 0) pos = 0; else if (pos > max) pos = max;
    this.updateWithChangeEvent(event, pos / max);
  }

  updateWithChangeEvent(event, percent) {
    this.setPercent(percent, () => {
      if (this.props.onChange) this.props.onChange(event, this.state.value);
    });
  }

  percentToValue(percent) {
    return percent * (this.props.max - this.props.min) + this.props.min;
  }

  render() {
    const {
      description,
      disabled,
      disableFocusRipple,
      error,
      max,
      min,
      name,
      required,
      step,
      style,
      ...others,
    } = this.props;

    const {prepareStyles} = this.context.muiTheme;
    const styles = getStyles(this.props, this.context, this.state);
    const sliderStyles = styles.slider;

    let handleStyles = {};
    let percent = this.state.percent;
    if (percent > 1) percent = 1; else if (percent < 0) percent = 0;

    if (percent === 0) {
      handleStyles = Object.assign(
        {},
        styles.handle,
        styles.handleWhenPercentZero,
        this.state.active && styles.handleWhenActive,
        (this.state.hovered || this.state.focused) && !disabled &&
        styles.handleWhenPercentZeroAndFocused,
        disabled && styles.handleWhenPercentZeroAndDisabled
      );
    } else {
      handleStyles = Object.assign(
        {},
        styles.handle,
        this.state.active && styles.handleWhenActive,
        disabled && styles.handleWhenDisabled
      );
    }

    const rippleStyle = Object.assign(
      {},
      styles.ripple,
      percent === 0 && styles.rippleWhenPercentZero
    );

    const rippleShowCondition = (this.state.hovered || this.state.focused) && !this.state.active;

    let focusRipple;
    if (!disabled && !disableFocusRipple) {
      focusRipple = (
        <FocusRipple
          ref="focusRipple"
          key="focusRipple"
          style={rippleStyle}
          innerStyle={styles.rippleInner}
          show={rippleShowCondition}
          muiTheme={this.context.muiTheme}
          color={styles.rippleColor.fill}
        />
      );
    }

    let handleDragProps;
    if (!disabled) {
      handleDragProps = {
        onTouchStart: this.onHandleTouchStart,
        onMouseDown: this.onHandleMouseDown,
        onKeyDown: this.onHandleKeyDown,
      };
    }

    return (
      <div {...others} style={prepareStyles(Object.assign({}, style))}>
        <span>{description}</span>
        <span>{error}</span>
        <div
          style={prepareStyles(sliderStyles)}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onMouseDown={this.handleMouseDown}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onMouseUp={this.handleMouseUp}
          onTouchStart={this.handleTouchStart}
        >
          <div ref="track" style={prepareStyles(styles.track)}>
            <div style={prepareStyles(styles.filled)}></div>
            <div style={prepareStyles(styles.remaining)}></div>
            <div
              ref="handle"
              style={prepareStyles(handleStyles)}
              tabIndex={0}
              {...handleDragProps}
            >
              {focusRipple}
            </div>
          </div>
        </div>
        <input
          ref="input"
          type="hidden"
          name={name}
          value={this.state.value}
          required={required}
          min={min}
          max={max}
          step={step}
        />
      </div>
    );
  }
}

export default Slider;
