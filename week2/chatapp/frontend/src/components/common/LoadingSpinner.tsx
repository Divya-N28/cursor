import { CircularProgress, CircularProgressProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LoadingSpinnerProps extends Omit<CircularProgressProps, 'color'> {
  size?: 'small' | 'medium' | 'large';
  customColor?: string;
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 56,
};

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  customColor,
  ...props
}) => {
  return (
    <StyledCircularProgress
      size={sizeMap[size]}
      sx={customColor ? { color: customColor } : undefined}
      {...props}
    />
  );
}; 