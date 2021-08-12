const Selectors = {
    SEE_MORE: `div[role="button"].oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.oo9gr5id.gpro0wi8.lrazzd5p`,
    AUTHOR: `:is(h3.lzcic4wl strong span, h2.gmql0nx0 a span)`,
    MEDIA: `div.l9j0dhe7 a`,
    REACTIONS: `div.l9j0dhe7 span.pcp91wgn`,
    ENGAGEMENTS: `div.bp9cbjyn.j83agx80.pfnyh3mw.p1ueia1e div.gtad4xkn span`,
    DATE: `span.tojvnm2t.a6sixzi8.abs2jz4q.a8s20v7p a`,
    POST_URL_EXPANDED: `:is(span.tojvnm2t.a6sixzi8.abs2jz4q.a8s20v7p a[role="link"])`,
    POST_URL_SEARCHRES: `a[role="link"].oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.a8c37x1j.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.gmql0nx0.p8dawk7l`,
    POST_EXPANDED: `div[role="article"].lzcic4wl`,
    POST_SEARCHRES: `div[role="article"].sjgh65i0`,
    POST_CONTENT: `div[data-ad-preview="message"] span`,
}

module.exports = {
    Selectors
}