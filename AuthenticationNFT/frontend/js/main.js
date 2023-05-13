document.getElementById('nft-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const mintAddress = document.getElementById('mint-address').value;
  const network = document.getElementById('network').value;

  fetch('/getNFTMetadata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mintAddress, network }),
  })
  .then(response => response.json())
  .then(data => {
    // Aquí puedes hacer algo con los datos, como mostrar la imagen y los metadatos del NFT
    const nftDisplay = document.getElementById('nft-display');
    nftDisplay.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.image}" alt="${data.name}">
      <p>${data.description}</p>
    `;
  })
  .catch((error) => {
    console.error('Error:', error);
  });
});

