<script>
  import { reviews } from '../data.js';
  import { goBack, goTo, currentUser, notify } from '../stores.js';
  import Modal from '../Modal.svelte';
  import { apiPost } from '../api.js';

  let showModal = false;
  let rating = 5;
  let text = '';

  $: alreadyReviewed = $currentUser && $reviews.some(r => r.username === $currentUser.username);
  $: avgRating = $reviews.length ? ($reviews.reduce((s,r)=>s+r.rating,0) / $reviews.length).toFixed(1) : '0.0';

  async function submitReview() {
    if (!text.trim()) return;
    const date = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    try {
      const created = await apiPost('/reviews', { name: $currentUser?.name || 'User', rating, text, date, username: $currentUser.username });
      reviews.update((list) => [created, ...list]);
      notify('Thank you for your feedback!');
      text = ''; rating = 5;
      showModal = false;
    } catch (e) { alert(e.message); }
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Service Review</h1><div class="page-sub">Your feedback matters</div></div>
    {#if !alreadyReviewed}
      <button class="btn btn-primary" on:click={() => (showModal=true)}>Write a Review</button>
    {/if}
  </div>

  <div class="two-col" style="margin-bottom:20px;">
    <div class="card rating-card">
      <div class="big-rating">{avgRating}</div>
      <div class="stars">{'⭐'.repeat(Math.round(avgRating))}</div>
      <div class="sub">Public Ratings &middot; {$reviews.length} reviews</div>
    </div>

    {#if alreadyReviewed}
      <div class="card">
        <h3 style="margin-top:0;">About Travel Management</h3>
        <p class="about-text">Thanks for sharing your feedback! Here's a bit more about what we offer:</p>
        <ul class="feature-list">
          <li>End-to-end client, trip &amp; itinerary management</li>
          <li>Supplier network across hotels, travel &amp; packages</li>
          <li>Booking &amp; payment tracking with PDF export</li>
          <li>Expense logging with proof attachments</li>
          <li>Role-based dashboards for agents, managers &amp; head office</li>
        </ul>
      </div>
    {:else}
      <div class="card">
        <h3 style="margin-top:0;">We'd love to hear from you</h3>
        <p class="about-text">Share a quick review about your experience using our travel management platform. It only takes a minute.</p>
      </div>
    {/if}
  </div>

  <div class="card">
    <h3 style="margin-top:0;">Recent Reviews</h3>
    {#each $reviews as r}
      <div class="review-item">
        <div class="review-top">
          <b>{r.name}</b>
          <span>{'⭐'.repeat(r.rating)}</span>
        </div>
        <p>{r.text}</p>
        <small>{r.date}</small>
      </div>
    {:else}
      <div class="empty-state">No reviews yet.</div>
    {/each}
  </div>
</div>

{#if showModal}
  <Modal title="Write a Review" on:close={() => (showModal=false)}>
    <div class="form-row">
      <label>Your Rating</label>
      <div class="star-picker">
        {#each [1,2,3,4,5] as n}
          <button class="star-btn" class:filled={n<=rating} on:click={() => (rating=n)}>⭐</button>
        {/each}
      </div>
    </div>
    <div class="form-row">
      <label>Your Feedback</label>
      <textarea rows="4" bind:value={text} placeholder="Tell us about your experience..."></textarea>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" on:click={() => (showModal=false)}>Cancel</button>
      <button class="btn btn-primary" on:click={submitReview}>Submit Review</button>
    </div>
  </Modal>
{/if}

<style>
.rating-card{text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.big-rating{font-size:44px;font-weight:800;color:var(--teal-dark);}
.stars{font-size:18px;margin:4px 0;}
.sub{color:var(--text-dim);font-size:13px;}
.about-text{color:var(--text-dim);font-size:13.5px;}
.feature-list{margin:0;padding-left:18px;font-size:13.5px;color:var(--text);display:flex;flex-direction:column;gap:6px;}
.review-item{padding:12px 0;border-bottom:1px solid var(--border);}
.review-item:last-child{border-bottom:none;}
.review-top{display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px;}
.review-item p{margin:4px 0;font-size:13.5px;color:var(--text);}
.review-item small{color:var(--text-dim);}
.star-picker{display:flex;gap:6px;}
.star-btn{background:none;border:none;font-size:24px;opacity:.3;padding:0;}
.star-btn.filled{opacity:1;}
</style>
