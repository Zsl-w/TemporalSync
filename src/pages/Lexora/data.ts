import { Concept } from './types';

export const MOCK_CONCEPTS: Concept[] = [
  {
    id: 'synaptic-plasticity',
    domain: 'MEDICINE · NEUROSCIENCE',
    english: 'Synaptic Plasticity',
    chinese: '突触可塑性',
    pronunciation: '/sɪˈnæptɪk plæˈstɪsɪti/',
    conciseDefinition: '突触可塑性 (Synaptic Plasticity) 是指神经元之间的连接（突触）根据活动水平发生强度改变的能力。它是大脑学习、记忆形成以及从损伤中恢复的神经生物学基础。',
    deepExplanation: [
      '突触可塑性可以通过两种主要机制实现：长时程增强 (LTP) 和 长时程抑制 (LTD)。当突触两端的神经元频繁且同步地被激活时，LTP 会导致它们之间的信号传递变得更强；相反，如果活动不同步或频率很低，LTD 会减弱这种连接。',
      '这一理论最早由心理学家 Donald Hebb 在 1949 年提出，即著名的赫布理论（Hebbian Theory）："Cells that fire together, wire together" (一起放电的细胞连在一起)。',
      '在 AI 领域，人工神经网络中的权重更新（例如反向传播算法）正是受到了大脑突触可塑性的启发，尽管两者在具体计算机制上存在巨大差异。'
    ],
    learningState: 'learning',
    relations: [
      {
        id: 'action-potential',
        type: 'prerequisite',
        english: 'Action Potential',
        chinese: '动作电位'
      },
      {
        id: 'synaptic-plasticity',
        type: 'current',
        english: 'Synaptic Plasticity',
        chinese: '突触可塑性'
      },
      {
        id: 'ltp',
        type: 'derived',
        english: 'Long-term Potentiation',
        chinese: '长时程增强 (LTP)'
      },
      {
        id: 'ann',
        type: 'analogy',
        english: 'Artificial Neural Network',
        chinese: '人工神经网络'
      }
    ]
  },
  {
    id: 'backpropagation',
    domain: 'AI · MACHINE LEARNING',
    english: 'Backpropagation',
    chinese: '反向传播',
    pronunciation: '/ˌbækˌprɒpəˈɡeɪʃən/',
    conciseDefinition: '反向传播算法是训练人工神经网络最常用的方法。它通过计算损失函数关于网络权重的梯度，然后将误差从输出层向输入层反向传播，以此来更新权重，从而最小化预测误差。',
    deepExplanation: [
      '反向传播的核心是微积分中的链式法则（Chain Rule）。在正向传播计算出预测结果和误差后，反向传播从最后一层开始，逐层计算每个神经元的权重对最终误差的贡献（梯度）。',
      '这些梯度随后被优化器（如 SGD、Adam）用来更新网络权重。',
      '尽管反向传播在数学上非常有效，但它在生物学上并不合理，因为大脑中的神经元似乎没有直接的反向误差信号传递机制。'
    ],
    learningState: 'mastered',
    relations: [
      {
        id: 'gradient-descent',
        type: 'prerequisite',
        english: 'Gradient Descent',
        chinese: '梯度下降'
      },
      {
        id: 'backpropagation',
        type: 'current',
        english: 'Backpropagation',
        chinese: '反向传播'
      }
    ]
  }
];

export const RECENT_SEARCHES = [
  { id: 'synaptic-plasticity', english: 'Synaptic Plasticity', chinese: '突触可塑性', time: '2小时前' },
  { id: 'backpropagation', english: 'Backpropagation', chinese: '反向传播', time: '5小时前' },
  { id: 'transformer', english: 'Transformer', chinese: 'Transformer模型', time: '1天前' },
];
