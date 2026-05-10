// Example: Toggle recent verification details
document.addEventListener('DOMContentLoaded', () => {
  const verificationItems = document.querySelectorAll('.recent-verification-item');

  verificationItems.forEach(item => {
    const header = item.querySelector('.verification-header');
    header.addEventListener('click', () => {
      const details = item.querySelector('.verification-details');
      const isOpen = details.style.display === 'block';
      details.style.display = isOpen ? 'none' : 'block';
    });
  });

  // Example: Update stats dynamically (simulate data fetching)
  const stats = [
    { id: 'totalVerifications', value: 1247, change: 12, trend: 'up' },
    { id: 'accuracyRate', value: 94.2, change: 2.1, trend: 'up' },
    { id: 'fakeDetected', value: 89, change: -8, trend: 'down' },
    { id: 'processingTime', value: 2.3, change: -15, trend: 'down' }
  ];

  stats.forEach(stat => {
    const statValue = document.getElementById(stat.id);
    const statChange = document.getElementById(stat.id + 'Change');
    if (statValue) statValue.textContent = stat.value;
    if (statChange) {
      statChange.textContent = `${stat.trend === 'up' ? '+' : ''}${stat.change}%`;
      statChange.classList.add(stat.trend === 'up' ? 'text-green-500' : 'text-red-500');
    }
  });
});
