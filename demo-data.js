/**
 * 演示数据生成器
 * 用于快速体验星轨纪事的所有功能
 */

const DEMO_DATA = {
    events: [
        // 时间胶囊示例
        {
            id: 'demo_capsule_1',
            type: 'capsule',
            name: '春节假期',
            date: '2025-01-29T00:00:00',
            description: '期待与家人团聚的美好时光！',
            color: '#ef4444',
            important: true,
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_capsule_2',
            type: 'capsule',
            name: '好友生日',
            date: '2025-02-14T18:00:00',
            description: '记得准备生日礼物～',
            color: '#d946ef',
            important: false,
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_capsule_3',
            type: 'capsule',
            name: '期末考试',
            date: '2025-01-15T09:00:00',
            description: '冲刺复习，争取好成绩！',
            color: '#00d4ff',
            important: true,
            completed: false,
            createdAt: new Date().toISOString()
        },
        
        // 目标星轨示例
        {
            id: 'demo_track_1',
            type: 'track',
            name: '考研冲刺',
            date: '2025-12-25',
            description: '一战成硕！',
            color: '#ffd700',
            important: true,
            completed: false,
            progress: 65,
            milestones: [
                { name: '完成数学基础复习', completed: true },
                { name: '完成英语词汇背诵', completed: true },
                { name: '完成专业课一轮复习', completed: true },
                { name: '完成政治知识点梳理', completed: false },
                { name: '完成模拟试卷训练', completed: false }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_track_2',
            type: 'track',
            name: '减重计划',
            date: '2025-06-01',
            description: '健康生活，从今天开始！',
            color: '#10b981',
            important: false,
            completed: false,
            progress: 40,
            milestones: [
                { name: '制定饮食计划', completed: true },
                { name: '坚持运动30天', completed: true },
                { name: '减重5kg', completed: false },
                { name: '保持健康体重', completed: false }
            ],
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_track_3',
            type: 'track',
            name: '学习前端开发',
            date: '2025-08-01',
            description: '掌握现代前端技术栈',
            color: '#00d4ff',
            important: false,
            completed: false,
            progress: 50,
            milestones: [
                { name: 'HTML/CSS基础', completed: true },
                { name: 'JavaScript进阶', completed: true },
                { name: 'React框架学习', completed: false },
                { name: '完成个人项目', completed: false }
            ],
            createdAt: new Date().toISOString()
        },
        
        // 里程碑示例
        {
            id: 'demo_milestone_1',
            type: 'milestone',
            name: '大学毕业',
            date: '2024-06-30',
            description: '四年青春，不负韶华！',
            color: '#d946ef',
            important: true,
            completed: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_milestone_2',
            type: 'milestone',
            name: '找到第一份工作',
            date: '2024-09-01',
            description: '职业生涯的起点',
            color: '#ffd700',
            important: true,
            completed: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_milestone_3',
            type: 'milestone',
            name: '完成第一个项目',
            date: '2024-11-15',
            description: '技术成长的里程碑',
            color: '#00d4ff',
            important: true,
            completed: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_milestone_4',
            type: 'milestone',
            name: '独立生活',
            date: '2024-07-15',
            description: '搬进自己的公寓',
            color: '#10b981',
            important: false,
            completed: true,
            createdAt: new Date().toISOString()
        },
        
        // 时光信笺示例（作为events类型）
        {
            id: 'demo_letter_1',
            type: 'letter',
            name: '给一年后的自己',
            date: '2026-01-01',
            description: '亲爱的未来的我：当你看到这封信的时候，希望你已经实现了当初设定的目标。这一年里，不要忘记最初的梦想，即使路途艰辛，也要勇敢前行。记得照顾好自己，保持运动，保持阅读。成功固然重要，但快乐和健康更重要。加油！',
            color: '#10b981',
            important: false,
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo_letter_2',
            type: 'letter',
            name: '给毕业后的自己',
            date: '2025-06-30',
            description: '恭喜你毕业了！这四年的大学生活一定充满了欢笑和泪水。无论未来选择什么道路，都要记得：保持学习的热情、珍惜身边的朋友、勇于尝试新事物、不要害怕失败。祝你前程似锦！',
            color: '#10b981',
            important: true,
            completed: false,
            createdAt: new Date().toISOString()
        }
    ],
    
    checkIns: [
        // 模拟连续7天签到
        new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString()
    ],
    
    settings: {
        voiceEnabled: false,
        notificationsEnabled: true,
        particlesEnabled: true,
        musicVolume: 50,
        timezone: 'Asia/Shanghai'
    },
    
    achievements: {
        first_event: { id: 'first_event', name: '起航', desc: '创建第一个事件', icon: '🚀', unlocked: true },
        ten_events: { id: 'ten_events', name: '群星璀璨', desc: '创建10个事件', icon: '⭐', unlocked: true },
        first_complete: { id: 'first_complete', name: '里程碑', desc: '完成第一个目标', icon: '🏆', unlocked: true },
        streak_7: { id: 'streak_7', name: '坚持不懈', desc: '连续签到7天', icon: '🔥', unlocked: true },
        night_owl: { id: 'night_owl', name: '夜猫子', desc: '在深夜创建事件', icon: '🦉', unlocked: false },
        early_bird: { id: 'early_bird', name: '早起鸟', desc: '在清晨创建事件', icon: '🐦', unlocked: false },
        letter_sent: { id: 'letter_sent', name: '时光信使', desc: '发送第一封时光信笺', icon: '✉️', unlocked: true },
        constellation: { id: 'constellation', name: '守护星座', desc: '生成你的专属星座', icon: '🌌', unlocked: true }
    }
};

/**
 * 加载演示数据
 */
window.loadDemoData = function() {
    console.log('🎮 准备加载演示数据...');
    
    // 检查 DEMO_DATA 是否存在
    if (typeof DEMO_DATA === 'undefined') {
        console.error('❌ DEMO_DATA 未定义');
        alert('错误：演示数据未加载\n请刷新页面重试');
        return;
    }
    
    console.log('📊 演示数据包含:', DEMO_DATA.events.length, '个事件');
    console.log('📋 事件列表:', DEMO_DATA.events);
    
    if (confirm('是否加载演示数据？\n\n这将覆盖当前所有数据（如有）。\n建议在首次使用时加载演示数据来快速体验所有功能。')) {
        try {
            // 构建正确的数据格式（只包含events、checkIns、settings、achievements）
            const dataToSave = {
                events: DEMO_DATA.events,
                checkIns: DEMO_DATA.checkIns,
                settings: DEMO_DATA.settings,
                achievements: DEMO_DATA.achievements
            };
            
            // 保存到 localStorage
            localStorage.setItem('star_track_chronicles_data', JSON.stringify(dataToSave));
            console.log('✅ 演示数据已保存到 localStorage');
            
            // 设置已欢迎标记，避免循环显示引导
            localStorage.setItem('star_track_welcomed', 'true');
            
            // 验证数据
            const saved = localStorage.getItem('star_track_chronicles_data');
            const parsed = JSON.parse(saved);
            console.log('✔️ 验证：已保存', parsed.events.length, '个事件');
            console.log('📋 保存的事件:', parsed.events);
            
            // 设置标志，防止刷新时覆盖数据
            window._isLoadingDemo = true;
            
            // 等待一小段时间确保数据写入完成
            setTimeout(() => {
                // 再次验证数据是否还在
                const recheck = localStorage.getItem('star_track_chronicles_data');
                if (recheck) {
                    console.log('✅ 数据验证通过，准备刷新页面');
                    alert('演示数据加载成功！\n\n页面将自动刷新。');
                    // 给一点时间让标志设置生效
                    setTimeout(() => {
                        window.location.reload();
                    }, 50);
                } else {
                    console.error('❌ 数据丢失！');
                    alert('错误：数据保存后丢失\n请刷新页面重试');
                    window._isLoadingDemo = false;
                }
            }, 100);
        } catch (e) {
            console.error('❌ 加载演示数据失败:', e);
            console.error('错误详情:', e.message);
            console.error('错误堆栈:', e.stack);
            alert('加载失败：' + e.message);
        }
    }
}

/**
 * 清空所有数据
 */
window.clearAllData = function() {
    console.log('🗑️ 清空数据函数被调用');
    
    if (confirm('确定要清空所有数据吗？\n\n此操作不可恢复！')) {
        if (confirm('最后确认：真的要删除所有事件、信笺和成就数据吗？')) {
            console.log('⚠️ 用户确认清空数据');
            
            // 设置标志，防止 beforeunload 重新保存数据
            window._isClearing = true;
            
            // 清除 localStorage
            localStorage.removeItem('star_track_chronicles_data');
            localStorage.removeItem('star_track_welcomed');
            
            console.log('✅ 数据已从 localStorage 清除');
            
            // 清空内存中的数据（如果appData存在）
            if (typeof appData !== 'undefined') {
                appData.events = [];
                appData.checkIns = [];
                console.log('✅ 内存数据已清空');
            }
            
            alert('数据已清空！页面将自动刷新。');
            
            // 使用 replace 而不是 reload，避免触发 beforeunload
            window.location.replace(window.location.href);
        } else {
            console.log('❌ 用户取消清空操作');
        }
    } else {
        console.log('❌ 用户取消清空操作');
    }
}

// 在控制台提供快捷命令
console.log('%c🌟 星轨纪事 - 演示数据工具', 'color: #6b2fb5; font-size: 16px; font-weight: bold;');
console.log('%c使用以下命令快速操作：', 'color: #00d4ff; font-size: 14px;');
console.log('%c  loadDemoData()  - 加载演示数据', 'color: #10b981;');
console.log('%c  clearAllData()  - 清空所有数据', 'color: #ef4444;');
console.log('%c  DEMO_DATA       - 查看演示数据结构', 'color: #ffd700;');

// 验证函数是否正确定义
console.log('✅ demo-data.js 已加载');
console.log('📦 DEMO_DATA:', typeof DEMO_DATA !== 'undefined' ? '已定义' : '未定义');
console.log('🔧 loadDemoData:', typeof window.loadDemoData === 'function' ? '可用' : '不可用');
console.log('🗑️ clearAllData:', typeof window.clearAllData === 'function' ? '可用' : '不可用');

