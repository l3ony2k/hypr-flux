import { z } from 'zod';

// Common validation schemas
const baseValidation = {
  prompt: z.string().min(1).max(10000),
  response_format: z.enum(['url', 'b64_json']).optional(),
  output_format: z.enum(['png', 'jpeg', 'webp']).optional(),
};

// Flux model family common fields
const fluxModelFields = {
  steps: z.number().min(1).max(50),
  height: z.number().min(256).max(1440),
  width: z.number().min(256).max(1440),
};

// Model-specific validation schemas
export const modelValidations = {
  'flux-1.1-pro': z.object({
    ...baseValidation,
    model: z.literal('flux-1.1-pro'),
    ...fluxModelFields,
  }),
  'flux-pro': z.object({
    ...baseValidation,
    model: z.literal('flux-pro'),
    ...fluxModelFields,
  }),
  'flux-dev': z.object({
    ...baseValidation,
    model: z.literal('flux-dev'),
    ...fluxModelFields,
  }),
  'flux-schnell': z.object({
    ...baseValidation,
    model: z.literal('flux-schnell'),
    ...fluxModelFields,
  }),
  'recraft-v3': z.object({
    ...baseValidation,
    model: z.literal('recraft-v3'),
    size: z.enum([
      '1024x1024',
      '1365x1024',
      '1024x1365',
      '1536x1024',
      '1024x1536',
      '1820x1024',
      '1024x1820',
      '1024x2048',
      '2048x1024',
      '1434x1024',
      '1024x1434',
      '1024x1280',
      '1280x1024',
      '1024x1707',
      '1707x1024',
    ]),
    style: z
      .enum([
        'digital_illustration',
        'digital_illustration/pixel_art',
        'digital_illustration/hand_drawn',
        'digital_illustration/grain',
        'digital_illustration/infantile_sketch',
        'digital_illustration/2d_art_poster',
        'digital_illustration/handmade_3d',
        'digital_illustration/hand_drawn_outline',
        'digital_illustration/engraving_color',
        'digital_illustration/2d_art_poster_2',
        'realistic_image',
        'realistic_image/b_and_w',
        'realistic_image/hard_flash',
        'realistic_image/hdr',
        'realistic_image/natural_light',
        'realistic_image/studio_portrait',
        'realistic_image/enterprise',
        'realistic_image/motion_blur',
        'vector_illustration',
        'vector_illustration/engraving',
        'vector_illustration/line_art',
        'vector_illustration/line_circuit',
        'vector_illustration/linocut',
      ])
      .optional(),
  }),
  'ideogram-v2': z.object({
    ...baseValidation,
    model: z.literal('ideogram-v2'),
    negative_prompt: z.string().max(10000).optional(),
    aspect_ratio: z
      .enum([
        '1:1',
        '16:9',
        '9:16',
        '4:3',
        '3:4',
        '3:2',
        '2:3',
        '16:10',
        '10:16',
        '3:1',
        '1:3',
      ])
      .optional(),
    style_type: z
      .enum(['Auto', 'General', 'Realistic', 'Design', 'Render 3D', 'Anime'])
      .optional(),
    magic_prompt_option: z.enum(['Auto', 'On', 'Off']).optional(),
  }),
  'ideogram-v2-turbo': z.object({
    ...baseValidation,
    model: z.literal('ideogram-v2-turbo'),
    negative_prompt: z.string().max(10000).optional(),
    aspect_ratio: z
      .enum([
        '1:1',
        '16:9',
        '9:16',
        '4:3',
        '3:4',
        '3:2',
        '2:3',
        '16:10',
        '10:16',
        '3:1',
        '1:3',
      ])
      .optional(),
    style_type: z
      .enum(['Auto', 'General', 'Realistic', 'Design', 'Render 3D', 'Anime'])
      .optional(),
    magic_prompt_option: z.enum(['Auto', 'On', 'Off']).optional(),
  }),
  'dall-e-3': z.object({
    ...baseValidation,
    model: z.literal('dall-e-3'),
    // n: z.literal(1),
    quality: z.enum(['standard', 'hd']).optional(),
    size: z.enum(['1024x1024', '1792x1024', '1024x1792']),
    style: z.enum(['vivid', 'natural']).optional(),
  }),
};

export type ModelConfig = {
  id: string;
  name: string;
  description: string;
  fields: Field[];
};

export type Field = {
  name: string;
  type: 'text' | 'number' | 'select' | 'range' | 'textarea';
  label: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  default?: any;
};

export type ModelFamily = {
  id: string;
  name: string;
  description: string;
  models: ModelConfig[];
};

// Common fields for Flux model family
const fluxCommonFields = [
  {
    name: 'model',
    type: 'select',
    label: 'Model Version',
    required: true,
    options: ['flux-1.1-pro', 'flux-pro', 'flux-dev', 'flux-schnell'],
    default: 'flux-1.1-pro',
  },
  {
    name: 'prompt',
    type: 'textarea',
    label: 'Prompt',
    required: true,
  },
  {
    name: 'steps',
    type: 'range',
    label: 'Steps',
    min: 1,
    max: 50,
    default: 20,
  },
  {
    name: 'height',
    type: 'range',
    label: 'Height',
    min: 256,
    max: 1440,
    step: 32,
    default: 1024,
  },
  {
    name: 'width',
    type: 'range',
    label: 'Width',
    min: 256,
    max: 1440,
    step: 32,
    default: 1024,
  },
];

// Common fields for Ideogram models
const ideogramCommonFields = [
  {
    name: 'model',
    type: 'select',
    label: 'Model Version',
    required: true,
    options: ['ideogram-v2', 'ideogram-v2-turbo'],
    default: 'ideogram-v2',
  },
  {
    name: 'prompt',
    type: 'textarea',
    label: 'Prompt',
    required: true,
  },
  {
    name: 'negative_prompt',
    type: 'textarea',
    label: 'Negative Prompt',
  },
  {
    name: 'aspect_ratio',
    type: 'select',
    label: 'Aspect Ratio',
    options: [
      '1:1',
      '16:9',
      '9:16',
      '4:3',
      '3:4',
      '3:2',
      '2:3',
      '16:10',
      '10:16',
      '3:1',
      '1:3',
    ],
    default: '1:1',
  },
  {
    name: 'style_type',
    type: 'select',
    label: 'Style Type',
    options: ['Auto', 'General', 'Realistic', 'Design', 'Render 3D', 'Anime'],
    default: 'Auto',
  },
  {
    name: 'magic_prompt_option',
    type: 'select',
    label: 'Magic Prompt',
    options: ['Auto', 'On', 'Off'],
    default: 'Auto',
  },
];

export const modelFamilies: ModelFamily[] = [
  {
    id: 'flux',
    name: 'Flux',
    description: 'High-quality image generation models from Flux family',
    models: [
      {
        id: 'flux',
        name: 'Flux',
        description: 'Flux model family with multiple versions',
        fields: fluxCommonFields,
      },
    ],
  },
  {
    id: 'recraft',
    name: 'Recraft',
    description: 'Advanced AI image generation with multiple style options',
    models: [
      {
        id: 'recraft-v3',
        name: 'Recraft V3',
        description: 'Latest version of Recraft AI',
        fields: [
          {
            name: 'prompt',
            type: 'textarea',
            label: 'Prompt',
            required: true,
          },
          {
            name: 'size',
            type: 'select',
            label: 'Size',
            required: true,
            options: [
              '1024x1024',
              '1365x1024',
              '1024x1365',
              '1536x1024',
              '1024x1536',
              '1820x1024',
              '1024x1820',
              '1024x2048',
              '2048x1024',
              '1434x1024',
              '1024x1434',
              '1024x1280',
              '1280x1024',
              '1024x1707',
              '1707x1024',
            ],
            default: '1024x1024',
          },
          {
            name: 'style',
            type: 'select',
            label: 'Style',
            options: [
              'digital_illustration',
              'digital_illustration/pixel_art',
              'digital_illustration/hand_drawn',
              'digital_illustration/grain',
              'digital_illustration/infantile_sketch',
              'digital_illustration/2d_art_poster',
              'digital_illustration/handmade_3d',
              'digital_illustration/hand_drawn_outline',
              'digital_illustration/engraving_color',
              'digital_illustration/2d_art_poster_2',
              'realistic_image',
              'realistic_image/b_and_w',
              'realistic_image/hard_flash',
              'realistic_image/hdr',
              'realistic_image/natural_light',
              'realistic_image/studio_portrait',
              'realistic_image/enterprise',
              'realistic_image/motion_blur',
              'vector_illustration',
              'vector_illustration/engraving',
              'vector_illustration/line_art',
              'vector_illustration/line_circuit',
              'vector_illustration/linocut',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    description: 'Versatile image generation with advanced style control',
    models: [
      {
        id: 'ideogram',
        name: 'Ideogram',
        description: 'Ideogram model family',
        fields: ideogramCommonFields,
      },
    ],
  },
  {
    id: 'dalle',
    name: 'DALL·E',
    description: "OpenAI's advanced image generation models",
    models: [
      {
        id: 'dall-e-3',
        name: 'DALL·E 3',
        description: 'Latest version of DALL·E',
        fields: [
          {
            name: 'prompt',
            type: 'textarea',
            label: 'Prompt',
            required: true,
          },
          {
            name: 'size',
            type: 'select',
            label: 'Size',
            options: ['1024x1024', '1792x1024', '1024x1792'],
            default: '1024x1024',
          },
          {
            name: 'quality',
            type: 'select',
            label: 'Quality',
            options: ['standard', 'hd'],
            default: 'hd',
          },
          {
            name: 'style',
            type: 'select',
            label: 'Style',
            options: ['vivid', 'natural'],
            default: 'natural',
          },
        ],
      },
    ],
  },
];
