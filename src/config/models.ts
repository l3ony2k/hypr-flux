import { z } from 'zod';

// Common validation schemas
const baseValidation = {
  prompt: z.string().min(1).max(10000),
  response_format: z.enum(['url', 'b64_json']).optional(),
  output_format: z.enum(['png', 'jpeg', 'webp']).optional(),
};

// Model-specific validation schemas
export const modelValidations = {
  'sdxl-1.0': z.object({
    ...baseValidation,
    model: z.literal('sdxl-1.0'),
    height: z.number().min(640).max(1536),
    width: z.number().min(640).max(1536),
    cfg_scale: z.number().min(0).max(35),
    sampler: z.enum([
      'DDIM',
      'DDPM',
      'K_DPMPP_2M',
      'K_DPMPP_2S_ANCESTRAL',
      'K_DPM_2',
      'K_DPM_2_ANCESTRAL',
      'K_EULER',
      'K_EULER_ANCESTRAL',
      'K_HEUN',
      'K_LMS',
    ]),
    seed: z.number().min(0).max(4294967295).optional(),
    steps: z.number().min(1).max(50),
    style_preset: z.enum([
      '3d-model',
      'analog-film',
      'anime',
      'cinematic',
      'comic-book',
      'digital-art',
      'enhance',
      'fantasy-art',
      'isometric',
      'line-art',
      'low-poly',
      'modeling-compound',
      'neon-punk',
      'origami',
      'photographic',
      'pixel-art',
      'tile-texture',
    ]).optional(),
  }),
  'sd3-core': z.object({
    ...baseValidation,
    model: z.literal('sd3-core'),
    aspect_ratio: z.enum(['16:9', '1:1', '21:9', '2:3', '3:2', '4:5', '5:4', '9:16', '9:21']).optional(),
    seed: z.number().min(0).max(4294967294).optional(),
    negative_prompt: z.string().max(10000).optional(),
    style_preset: z.enum([
      '3d-model',
      'analog-film',
      'anime',
      'cinematic',
      'comic-book',
      'digital-art',
      'enhance',
      'fantasy-art',
      'isometric',
      'line-art',
      'low-poly',
      'modeling-compound',
      'neon-punk',
      'origami',
      'photographic',
      'pixel-art',
      'tile-texture',
    ]).optional(),
  }),
};

// Add validation schemas for other SD models
['sd3-ultra', 'sd3-large', 'sd3-large-turbo', 'sd3-medium', 'sd3.5-large', 'sd3.5-large-turbo', 'sd3.5-medium'].forEach(model => {
  modelValidations[model] = z.object({
    ...baseValidation,
    model: z.literal(model),
    aspect_ratio: z.enum(['16:9', '1:1', '21:9', '2:3', '3:2', '4:5', '5:4', '9:16', '9:21']).optional(),
    seed: z.number().min(0).max(4294967294).optional(),
    negative_prompt: z.string().max(10000).optional(),
  });
});

export type ModelConfig = {
  id: string;
  name: string;
  description: string;
  fields: Field[];
};

export type Field = {
  name: string;
  type: 'text' | 'number' | 'select' | 'range' | 'textarea' | 'checkbox';
  label: string;
  required?: boolean;
  options?: (string|number)[];
  min?: number;
  max?: number;
  step?: number;
  default?: any;
  showFor?: string[];
};

export type ModelFamily = {
  id: string;
  name: string;
  description: string;
  models: ModelConfig[];
};

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
        fields: [
          {
            name: 'model',
            type: 'select',
            label: 'Model Version',
            required: true,
            options: ['flux-1.1-pro-ultra', 'flux-1.1-pro', 'flux-pro', 'flux-dev', 'flux-schnell'],
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
            showFor: ['flux-1.1-pro', 'flux-pro', 'flux-dev', 'flux-schnell'],
          },
          {
            name: 'height',
            type: 'range',
            label: 'Height',
            min: 256,
            max: 1440,
            step: 32,
            default: 1024,
            showFor: ['flux-1.1-pro', 'flux-pro', 'flux-dev', 'flux-schnell'],
          },
          {
            name: 'width',
            type: 'range',
            label: 'Width',
            min: 256,
            max: 1440,
            step: 32,
            default: 1024,
            showFor: ['flux-1.1-pro', 'flux-pro', 'flux-dev', 'flux-schnell'],
          },
          {
            name: 'aspect_ratio',
            type: 'select',
            label: 'Aspect Ratio',
            options: [
              '21:9',
              '16:9',
              '3:2',
              '4:3',
              '5:4',
              '1:1',
              '4:5',
              '3:4',
              '2:3',
              '9:16',
              '9:21',
            ],
            default: '1:1',
            showFor: ['flux-1.1-pro-ultra'],
          },
          {
            name: 'raw',
            type: 'checkbox',
            label: 'Raw Output',
            default: false,
            showFor: ['flux-1.1-pro-ultra'],
          },
        ],
      },
    ],
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    description: 'Advanced Stable Diffusion models with various capabilities',
    models: [
      {
        id: 'stable-diffusion',
        name: 'Stable Diffusion',
        description: 'Stable Diffusion model family',
        fields: [
          {
            name: 'model',
            type: 'select',
            label: 'Model Version',
            required: true,
            options: [
              'sd3.5-large',
              'sd3.5-medium',
              'sd3.5-large-turbo',
              'sd3-ultra',
              'sd3-large',
              'sd3-large-turbo',
              'sd3-core',
              'sd3-medium',
              'sdxl-1.0',
            ],
            default: 'sd3.5-large',
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
            showFor: [
              'sd3-core',
              'sd3-ultra',
              'sd3-large',
              'sd3-large-turbo',
              'sd3-medium',
              'sd3.5-large',
              'sd3.5-large-turbo',
              'sd3.5-medium'
            ],
          },
          {
            name: 'height',
            type: 'range',
            label: 'Height',
            min: 640,
            max: 1536,
            step: 64,
            default: 1024,
            showFor: ['sdxl-1.0'],
          },
          {
            name: 'width',
            type: 'range',
            label: 'Width',
            min: 640,
            max: 1536,
            step: 64,
            default: 1024,
            showFor: ['sdxl-1.0'],
          },
          {
            name: 'cfg_scale',
            type: 'range',
            label: 'CFG Scale',
            min: 0,
            max: 35,
            step: 0.5,
            default: 7,
            showFor: ['sdxl-1.0'],
          },
          {
            name: 'sampler',
            type: 'select',
            label: 'Sampler',
            options: [
              'DDIM',
              'DDPM',
              'K_DPMPP_2M',
              'K_DPMPP_2S_ANCESTRAL',
              'K_DPM_2',
              'K_DPM_2_ANCESTRAL',
              'K_EULER',
              'K_EULER_ANCESTRAL',
              'K_HEUN',
              'K_LMS',
            ],
            default: 'K_EULER',
            showFor: ['sdxl-1.0'],
          },
          {
            name: 'steps',
            type: 'range',
            label: 'Steps',
            min: 1,
            max: 50,
            default: 20,
            showFor: ['sdxl-1.0'],
          },
          {
            name: 'aspect_ratio',
            type: 'select',
            label: 'Aspect Ratio',
            options: ['16:9', '1:1', '21:9', '2:3', '3:2', '4:5', '5:4', '9:16', '9:21'],
            default: '1:1',
            showFor: [
              'sd3-core',
              'sd3-ultra',
              'sd3-large',
              'sd3-large-turbo',
              'sd3-medium',
              'sd3.5-large',
              'sd3.5-large-turbo',
              'sd3.5-medium'
            ],
          },
          {
            name: 'style_preset',
            type: 'select',
            label: 'Style Preset',
            options: [
              '3d-model',
              'analog-film',
              'anime',
              'cinematic',
              'comic-book',
              'digital-art',
              'enhance',
              'fantasy-art',
              'isometric',
              'line-art',
              'low-poly',
              'modeling-compound',
              'neon-punk',
              'origami',
              'photographic',
              'pixel-art',
              'tile-texture',
            ],
            showFor: ['sdxl-1.0', 'sd3-core'],
          },
          {
            name: 'seed',
            type: 'number',
            label: 'Seed',
            min: 0,
            max: 4294967295,
          },
        ],
      },
    ],
  },
  {
    id: 'recraft',
    name: 'Recraft',
    description: 'Advanced AI image generation with multiple style options',
    models: [
      {
        id: 'recraft',
        name: 'Recraft',
        description: 'Recraft model family',
        fields: [
          {
            name: 'model',
            type: 'select',
            label: 'Model Version',
            required: true,
            options: ['recraft-v3'],
            default: 'recraft-v3',
          },
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
    id: 'dalle',
    name: 'DALL·E',
    description: "OpenAI's advanced image generation models",
    models: [
      {
        id: 'dalle',
        name: 'DALL·E',
        description: 'DALL·E model family',
        fields: [
          {
            name: 'model',
            type: 'select',
            label: 'Model Version',
            required: true,
            options: ['dall-e-3', 'dall-e-2'],
            default: 'dall-e-3',
          },
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
            options: ['1024x1024', '1792x1024', '1024x1792'],
            showFor: ['dall-e-3'],
            default: '1024x1024',
          },
          {
            name: 'size',
            type: 'select',
            label: 'Size',
            required: true,
            options: ['256x256', '512x512', '1024x1024'],
            showFor: ['dall-e-2'],
            default: '1024x1024',
          },
          {
            name: 'quality',
            type: 'select',
            label: 'Quality',
            options: ['standard', 'hd'],
            showFor: ['dall-e-3'],
            default: 'standard',
          },
          {
            name: 'style',
            type: 'select',
            label: 'Style',
            options: ['vivid', 'natural'],
            showFor: ['dall-e-3'],
            default: 'vivid',
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
        description: 'Ideogram model family with multiple versions',
        fields: [
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
            options: [
              'Auto',
              'General',
              'Realistic',
              'Design',
              'Render 3D',
              'Anime',
            ],
            default: 'Auto',
          },
          {
            name: 'magic_prompt_option',
            type: 'select',
            label: 'Magic Prompt',
            options: ['Auto', 'On', 'Off'],
            default: 'Auto',
          },
        ],
      },
    ],
  },
];