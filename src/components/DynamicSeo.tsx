import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const DynamicSeo: React.FC = () => {
  const { filterState, selectedProduct, settings, products } = useStore();

  useEffect(() => {
    let title = 'Majoca Moda - Moda Infanto-Juvenil (RN ao 18 anos) • Ubá/MG';
    let description =
      'Loja de moda infantil e juvenil em Ubá/MG. Roupas confortáveis, estilosas e de alta qualidade do RN ao 18 anos. Entrega rápida e retirada em Ubá.';
    let keywords =
      'majoca moda, moda infantil ubá, loja de roupa infantil ubá mg, roupas de bebe uba, moda juvenil uba, rn ao 18 anos, vestidos infantis, conjuntos infantis';
    let ogImage = settings.heroImage || '';

    // 1. If product is open in modal
    if (selectedProduct) {
      const priceFormatted = selectedProduct.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      title = `${selectedProduct.name} - ${priceFormatted} | Majoca Moda`;
      description = `Compre ${selectedProduct.name} por ${priceFormatted} na Majoca Moda em Ubá/MG. Tamanhos: ${selectedProduct.sizes.map((s) => s.size).join(', ')}. ${selectedProduct.description.slice(0, 120)}...`;
      if (selectedProduct.images.length > 0) {
        ogImage = selectedProduct.images[0];
      }
    }
    // 2. If filtering by category or subcategory
    else if (filterState.category !== 'todas') {
      const catName =
        filterState.category === 'bebe'
          ? 'Bebê (RN ao GG / 0 a 12 meses)'
          : filterState.category === 'infantil'
          ? 'Infantil (1 ao 10 anos)'
          : filterState.category === 'juvenil'
          ? 'Juvenil & Teen (12 ao 18 anos)'
          : 'Acessórios & Calçados';

      const genderText =
        filterState.subcategory === 'menina'
          ? 'Menina'
          : filterState.subcategory === 'menino'
          ? 'Menino'
          : '';

      const subText =
        filterState.subCategoryName !== 'todas'
          ? ` • ${filterState.subCategoryName}`
          : '';

      title = `Moda ${catName} ${genderText}${subText} | Majoca Moda Ubá`;
      description = `Confira a coleção de roupas para ${catName} ${genderText}${subText} na Majoca Moda. Peças selecionadas com carinho e conforto em Ubá/MG.`;
      keywords += `, roupas ${filterState.category} uba, moda ${filterState.category}`;
    } else if (filterState.search.trim()) {
      title = `Busca por "${filterState.search}" | Majoca Moda Ubá`;
      description = `Resultados de busca para "${filterState.search}" na Majoca Moda - Moda Infantil e Juvenil em Ubá/MG.`;
    }

    // Update document title
    document.title = title;

    // Helper to update meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      let element = document.querySelector(
        isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
      );
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:url', window.location.href, true);
    updateMeta('og:type', selectedProduct ? 'product' : 'website', true);
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname);

    // Dynamic JSON-LD Schema.org
    const storeJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: 'Majoca Moda - Moda Infanto-Juvenil',
      alternateName: 'Majoca Moda Ubá',
      description:
        'Loja de moda infantil e juvenil do RN ao 18 anos. Ubá - Minas Gerais.',
      image: ogImage,
      url: window.location.origin,
      telephone: '+55-32-99863-8101',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Elpidia da Silva Fagundes, 409 - Térreo',
        addressLocality: 'Ubá',
        addressRegion: 'MG',
        postalCode: '36500-000',
        addressCountry: 'BR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -21.1215,
        longitude: -42.9431,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '09:00',
          closes: '13:00',
        },
      ],
      sameAs: [
        'https://instagram.com/majocamoda',
        'https://wa.me/5532998638101',
      ],
    };

    // Breadcrumbs JSON-LD
    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: window.location.origin,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name:
            filterState.category !== 'todas'
              ? `Moda ${filterState.category}`
              : 'Catálogo',
          item: `${window.location.origin}/#catalogo-produtos`,
        },
        ...(selectedProduct
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: selectedProduct.name,
                item: window.location.href,
              },
            ]
          : []),
      ],
    };

    // Product or ItemList JSON-LD
    let itemsJsonLd: any = null;
    if (selectedProduct) {
      itemsJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: selectedProduct.name,
        image: selectedProduct.images,
        description: selectedProduct.description,
        sku: selectedProduct.sku,
        brand: {
          '@type': 'Brand',
          name: 'Majoca Moda',
        },
        offers: {
          '@type': 'Offer',
          url: window.location.href,
          priceCurrency: 'BRL',
          price: selectedProduct.price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'Majoca Moda',
          },
        },
      };
    } else {
      itemsJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.slice(0, 10).map((prod, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${window.location.origin}/#produto-${prod.id}`,
          name: prod.name,
          image: prod.images[0],
        })),
      };
    }

    // Inject all scripts in DOM
    const injectJsonLd = (id: string, data: object) => {
      let script = document.getElementById(id);
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    };

    injectJsonLd('jsonld-store', storeJsonLd);
    injectJsonLd('jsonld-breadcrumbs', breadcrumbJsonLd);
    injectJsonLd('jsonld-items', itemsJsonLd);
  }, [filterState, selectedProduct, settings, products]);

  return null;
};
