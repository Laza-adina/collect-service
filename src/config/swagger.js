// src/config/swagger.js
require('dotenv').config();
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UGC Platform — Collect Service',
      version: '1.0.0',
      description: 'Collecte & Diffusion UGC',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3004}`,
        description: 'Dev server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'UGC Assets', description: 'Gestion des contenus UGC collectés' },
      { name: 'Moderation', description: 'Modération des assets et avis' },
      { name: 'Reviews', description: 'Demandes d\'avis après achat' },
      { name: 'Widgets', description: 'Galeries intégrables e-commerce' },
    ],
    paths: {

      // ── UGC ASSETS
      '/api/v1/ugc': {
        post: {
          tags: ['UGC Assets'],
          summary: 'Ajouter un asset UGC',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['brandId', 'source', 'mediaType', 'url'],
                  properties: {
                    brandId: { type: 'string', format: 'uuid' },
                    campaignId: { type: 'string', format: 'uuid' },
                    source: { type: 'string', enum: ['CAMPAIGN','HASHTAG','MENTION','REVIEW_REQUEST','MANUAL'] },
                    mediaType: { type: 'string', enum: ['VIDEO','PHOTO','CAROUSEL','TESTIMONIAL_VIDEO','TEXT_REVIEW'] },
                    url: { type: 'string', format: 'uri', example: 'https://res.cloudinary.com/demo/video.mp4' },
                    thumbnail: { type: 'string', format: 'uri' },
                    caption: { type: 'string' },
                    authorHandle: { type: 'string', example: '@lucas_ugc' },
                    platform: { type: 'string', enum: ['INSTAGRAM','TIKTOK','YOUTUBE','TWITTER','PINTEREST','LINKEDIN'] },
                    originalPostUrl: { type: 'string', format: 'uri' },
                    productTags: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string', format: 'uuid' },
                          productName: { type: 'string' },
                          productUrl: { type: 'string', format: 'uri' },
                          price: { type: 'number' },
                          posX: { type: 'number', description: '% largeur (0-100)' },
                          posY: { type: 'number', description: '% hauteur (0-100)' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Asset créé' },
            422: { description: 'Validation échouée' },
          },
        },
        get: {
          tags: ['UGC Assets'],
          summary: 'Lister les assets UGC',
          parameters: [
            { name: 'brandId', in: 'query', schema: { type: 'string' } },
            { name: 'source', in: 'query', schema: { type: 'string', enum: ['CAMPAIGN','HASHTAG','MENTION','REVIEW_REQUEST','MANUAL'] } },
            { name: 'mediaType', in: 'query', schema: { type: 'string' } },
            { name: 'moderationStatus', in: 'query', schema: { type: 'string', enum: ['PENDING','APPROVED','REJECTED','FLAGGED'] } },
            { name: 'platform', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'Liste des assets' } },
        },
      },

      '/api/v1/ugc/{id}': {
        get: {
          tags: ['UGC Assets'],
          summary: 'Détail d\'un asset',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Asset retourné' }, 404: { description: 'Introuvable' } },
        },
        delete: {
          tags: ['UGC Assets'],
          summary: 'Désactiver un asset',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Désactivé' } },
        },
      },

      '/api/v1/ugc/{id}/tags': {
        put: {
          tags: ['UGC Assets'],
          summary: 'Mettre à jour les tags produits (Shop The Look)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productTags'],
                  properties: {
                    productTags: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string', format: 'uuid' },
                          productName: { type: 'string' },
                          price: { type: 'number' },
                          posX: { type: 'number' },
                          posY: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Tags mis à jour' } },
        },
      },

      // ── MODERATION
      '/api/v1/moderation/assets/pending': {
        get: {
          tags: ['Moderation'],
          summary: 'Assets en attente de modération',
          parameters: [
            { name: 'brandId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Liste des assets pending' } },
        },
      },

      '/api/v1/moderation/assets/{id}': {
        patch: {
          tags: ['Moderation'],
          summary: 'Modérer un asset',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['APPROVED','REJECTED','FLAGGED'] },
                    rejectionReason: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Modéré' } },
        },
      },

      '/api/v1/moderation/assets/bulk': {
        post: {
          tags: ['Moderation'],
          summary: 'Modération en masse',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['assetIds', 'status'],
                  properties: {
                    assetIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                    status: { type: 'string', enum: ['APPROVED','REJECTED'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Modération appliquée' } },
        },
      },

      '/api/v1/moderation/reviews/pending': {
        get: {
          tags: ['Moderation'],
          summary: 'Avis clients en attente de modération',
          responses: { 200: { description: 'Liste des avis pending' } },
        },
      },

      '/api/v1/moderation/reviews/{reviewId}': {
        patch: {
          tags: ['Moderation'],
          summary: 'Approuver ou rejeter un avis client',
          parameters: [{ name: 'reviewId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['APPROVED','REJECTED'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Avis modéré' } },
        },
      },

      // ── REVIEWS
      '/api/v1/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Créer une demande d\'avis après achat',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['brandId', 'customerEmail', 'productName'],
                  properties: {
                    brandId: { type: 'string', format: 'uuid' },
                    customerEmail: { type: 'string', format: 'email', example: 'client@example.com' },
                    customerName: { type: 'string' },
                    orderId: { type: 'string' },
                    productId: { type: 'string', format: 'uuid' },
                    productName: { type: 'string', example: 'Air Max 2024' },
                    expiresAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Demande créée avec token unique' } },
        },
        get: {
          tags: ['Reviews'],
          summary: 'Lister les demandes d\'avis',
          parameters: [
            { name: 'brandId', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING','SENT','COMPLETED','EXPIRED'] } },
          ],
          responses: { 200: { description: 'Liste retournée' } },
        },
      },

      '/api/v1/reviews/submit/{token}': {
        post: {
          tags: ['Reviews'],
          summary: 'Soumettre un avis (public — lien email client)',
          parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['rating'],
                  properties: {
                    rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                    comment: { type: 'string', example: 'Excellent produit, je recommande !' },
                    mediaUrl: { type: 'string', format: 'uri' },
                    mediaType: { type: 'string', enum: ['VIDEO','PHOTO','TESTIMONIAL_VIDEO','TEXT_REVIEW'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Avis soumis avec succès' },
            400: { description: 'Avis déjà soumis' },
            410: { description: 'Lien expiré' },
          },
        },
      },

      '/api/v1/reviews/published': {
        get: {
          tags: ['Reviews'],
          summary: 'Avis publiés (public — affichage e-commerce)',
          parameters: [
            { name: 'brandId', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'productId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Avis approuvés et publiés' } },
        },
      },

      '/api/v1/reviews/{id}/sent': {
        patch: {
          tags: ['Reviews'],
          summary: 'Marquer la demande comme envoyée',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Statut mis à jour' } },
        },
      },

      // ── WIDGETS
      '/api/v1/widgets': {
        post: {
          tags: ['Widgets'],
          summary: 'Créer un widget galerie',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['brandId', 'name', 'slug'],
                  properties: {
                    brandId: { type: 'string', format: 'uuid' },
                    name: { type: 'string', example: 'Galerie homepage' },
                    slug: { type: 'string', example: 'galerie-homepage' },
                    layout: { type: 'string', enum: ['GRID','MASONRY','CAROUSEL','SHOP_THE_LOOK'], default: 'GRID' },
                    title: { type: 'string' },
                    maxItems: { type: 'integer', default: 12 },
                    primaryColor: { type: 'string', example: '#FF5733' },
                    showCaption: { type: 'boolean', default: true },
                    showHandle: { type: 'boolean', default: true },
                    showBuyButton: { type: 'boolean', default: false },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Widget créé' } },
        },
        get: {
          tags: ['Widgets'],
          summary: 'Lister mes widgets',
          parameters: [
            { name: 'brandId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Liste des widgets' } },
        },
      },

      '/api/v1/widgets/{id}': {
        get: {
          tags: ['Widgets'],
          summary: 'Détail d\'un widget',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Widget retourné' } },
        },
        patch: {
          tags: ['Widgets'],
          summary: 'Modifier un widget',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Widget mis à jour' } },
        },
        delete: {
          tags: ['Widgets'],
          summary: 'Désactiver un widget',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Désactivé' } },
        },
      },

      '/api/v1/widgets/{id}/items': {
        put: {
          tags: ['Widgets'],
          summary: 'Définir les assets du widget',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items'],
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          ugcAssetId: { type: 'string', format: 'uuid' },
                          position: { type: 'integer', minimum: 0 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Items mis à jour' } },
        },
      },

      '/api/v1/widgets/embed/render': {
        get: {
          tags: ['Widgets'],
          summary: 'Rendu public du widget (embed e-commerce)',
          description: 'Route publique — pas de JWT requis, utilise ?key=embedKey',
          security: [],
          parameters: [
            { name: 'key', in: 'query', required: true, schema: { type: 'string' }, description: 'Clé embed du widget' },
          ],
          responses: {
            200: { description: 'Widget et assets approuvés retournés' },
            401: { description: 'Clé widget invalide' },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsDoc(options);