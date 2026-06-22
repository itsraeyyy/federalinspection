import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from './stat-card';
import { IconFileText } from '@tabler/icons-react';

describe('StatCard Component', () => {
  it('renders correctly with basic props', () => {
    render(<StatCard label="Total Documents" value="1,200" icon={IconFileText} />);
    
    expect(screen.getByText('Total Documents')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument(); // Default badge
  });

  it('renders custom badge correctly', () => {
    render(
      <StatCard 
        label="Users" 
        value="45" 
        icon={IconFileText} 
        badge="Verified"
      />
    );
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders substats correctly', () => {
    render(
      <StatCard 
        label="Issues" 
        value="10" 
        icon={IconFileText} 
        substats={[
          { label: 'Resolved', value: '8' },
          { label: 'Pending', value: '2' }
        ]}
      />
    );
    
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders trend correctly if substats are not provided', () => {
    render(
      <StatCard 
        label="Growth" 
        value="25%" 
        icon={IconFileText} 
        trend="+5%"
        trendDirection="up"
      />
    );
    
    expect(screen.getByText('+5%')).toBeInTheDocument();
    expect(screen.getByText('Trend')).toBeInTheDocument();
  });

  it('does not render trend if substats are provided', () => {
    render(
      <StatCard 
        label="Issues" 
        value="10" 
        icon={IconFileText} 
        trend="+5%"
        substats={[
          { label: 'Resolved', value: '8' }
        ]}
      />
    );
    
    expect(screen.queryByText('+5%')).not.toBeInTheDocument();
    expect(screen.queryByText('Trend')).not.toBeInTheDocument();
  });
});
